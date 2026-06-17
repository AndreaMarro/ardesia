/**
 * Supabase Auth Service — autenticazione per ELAB Tutor
 * Wrappa le API Supabase Auth con interfaccia compatibile con AuthContext.
 * © Andrea Marro — 31/03/2026
 */

import supabase, { isSupabaseConfigured } from './supabaseClient';
import logger from '../utils/logger';

/**
 * Registra un nuovo utente.
 * @param {{ email: string, password: string, nome: string, cognome?: string, ruolo: string, scuola?: string, citta?: string }} data
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function signUp({ email, password, nome, cognome, ruolo, scuola, citta }) {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase non configurato' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, cognome, ruolo: ruolo || 'studente', scuola, citta },
    },
  });

  if (error) {
    logger.warn('[SupabaseAuth] signUp error:', error.message);
    return { success: false, error: translateAuthError(error.message) };
  }

  return {
    success: true,
    user: mapSupabaseUser(data.user),
  };
}

/**
 * Login con email e password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, hasLicense?: boolean, error?: string }>}
 */
export async function signIn(email, password) {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase non configurato' };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    logger.warn('[SupabaseAuth] signIn error:', error.message);
    return { success: false, error: translateAuthError(error.message) };
  }

  return {
    success: true,
    user: mapSupabaseUser(data.user),
    hasLicense: true, // Supabase users have access by default
  };
}

/**
 * Logout.
 */
export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

/**
 * Ritorna l'utente corrente dalla sessione Supabase.
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user ? mapSupabaseUser(user) : null;
}

/**
 * Ritorna la sessione corrente.
 * @returns {Promise<object|null>}
 */
export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Listener per cambi di stato auth.
 * @param {function} callback — (event, session) => void
 * @returns {{ data: { subscription } }} per unsubscribe
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

// ─── Helpers ───

/**
 * Mappa un user Supabase al formato usato da AuthContext.
 */
function mapSupabaseUser(supaUser) {
  if (!supaUser) return null;
  const meta = supaUser.user_metadata || {};
  return {
    id: supaUser.id,
    email: supaUser.email,
    username: meta.nome || supaUser.email?.split('@')[0] || '',
    name: meta.nome || '',
    surname: meta.cognome || '',
    ruolo: meta.ruolo || 'studente',
    userType: meta.ruolo === 'docente' || meta.ruolo === 'teacher' ? 'teacher' : 'family',
    scuola: meta.scuola || '',
    citta: meta.citta || '',
    kits: ['Volume 1', 'Volume 2', 'Volume 3'], // Default access
    premium: true,
    points: 0,
    level: 1,
    _supabase: true, // Flag per distinguere utenti Supabase
  };
}

/**
 * Traduce errori Supabase Auth in italiano.
 */
function translateAuthError(msg) {
  if (!msg) return 'Errore sconosciuto';
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Questa email e gia registrata. Prova ad accedere.';
  if (msg.includes('Invalid login'))
    return 'Email o password non corretti.';
  if (msg.includes('Password should be'))
    return 'La password deve avere almeno 6 caratteri.';
  if (msg.includes('Email not confirmed'))
    return 'Conferma la tua email prima di accedere.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Troppi tentativi. Riprova tra qualche minuto.';
  return msg;
}
