/**
 * Teacher Data Service — Legge dati classe da Supabase per la dashboard.
 * Fallback a localStorage se Supabase non e configurato.
 * © Andrea Marro — 31/03/2026
 */

import supabase, { isSupabaseConfigured } from './supabaseClient';
import studentService from './studentService';
import logger from '../utils/logger';

/**
 * Fetch tutte le classi dell'insegnante corrente.
 * @returns {Promise<Array<{ id, name, school, city, studentCount, created_at }>>}
 */
export async function fetchTeacherClasses() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('classes')
      .select('id, name, school, city, created_at')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Count students per class
    const withCounts = await Promise.all((data || []).map(async (cls) => {
      const { count } = await supabase
        .from('class_students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', cls.id);
      return { ...cls, studentCount: count || 0 };
    }));

    return withCounts;
  } catch (err) {
    logger.warn('[TeacherData] fetchTeacherClasses failed:', err.message);
    return [];
  }
}

/**
 * Fetch studenti di una classe.
 * @param {string} classId
 * @returns {Promise<Array<{ id, email, nome, joinedAt }>>}
 */
export async function fetchClassStudents(classId) {
  if (!isSupabaseConfigured() || !classId) return [];
  try {
    const { data, error } = await supabase
      .from('class_students')
      .select('student_id, joined_at')
      .eq('class_id', classId);

    if (error) throw error;
    if (!data?.length) return [];

    // Return student IDs with join date — user metadata is not accessible with anon key
    // Student names will be resolved from session data or class_students metadata
    return (data || []).map(row => ({
      id: row.student_id,
      email: '',
      nome: 'Studente',
      joinedAt: row.joined_at,
    }));
  } catch (err) {
    logger.warn('[TeacherData] fetchClassStudents failed:', err.message);
    return [];
  }
}

/**
 * Fetch sessioni studenti di una classe negli ultimi N giorni.
 * @param {string} classId
 * @param {number} days
 * @returns {Promise<Array>}
 */
export async function fetchClassSessions(classId, days = 30) {
  if (!isSupabaseConfigured() || !classId) return [];
  try {
    const studentIds = await getClassStudentIds(classId);
    if (!studentIds.length) return [];

    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await supabase
      .from('student_sessions')
      .select('*')
      .in('student_id', studentIds)
      .gte('started_at', since)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    logger.warn('[TeacherData] fetchClassSessions failed:', err.message);
    return [];
  }
}

/**
 * Fetch mood reports della classe.
 * @param {string} classId
 * @returns {Promise<Array>}
 */
export async function fetchClassMoods(classId) {
  if (!isSupabaseConfigured() || !classId) return [];
  try {
    const studentIds = await getClassStudentIds(classId);
    if (!studentIds.length) return [];

    const { data, error } = await supabase
      .from('mood_reports')
      .select('*')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  } catch (err) {
    logger.warn('[TeacherData] fetchClassMoods failed:', err.message);
    return [];
  }
}

/**
 * Fetch nudge non letti per una classe.
 * @param {string} classId
 * @returns {Promise<Array>}
 */
export async function fetchPendingNudges(classId) {
  if (!isSupabaseConfigured() || !classId) return [];
  try {
    const { data, error } = await supabase
      .from('nudges')
      .select('*')
      .eq('class_id', classId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    logger.warn('[TeacherData] fetchPendingNudges failed:', err.message);
    return [];
  }
}

/**
 * Crea una nuova classe.
 * @param {{ name: string, school?: string, city?: string }} classData
 * @returns {Promise<{ success: boolean, class?: object, error?: string }>}
 */
export async function createClass(classData) {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase non configurato' };
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Non autenticato' };

    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: classData.name,
        school: classData.school || null,
        city: classData.city || null,
        teacher_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, class: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Trasforma dati Supabase nel formato legacy usato dai tab della dashboard.
 * Cosi i tab esistenti non devono cambiare.
 */
export function transformToLegacyFormat(students, sessions, moods) {
  return students.map(student => {
    const mySessions = sessions.filter(s => s.student_id === student.id);
    const myMoods = moods.filter(m => m.student_id === student.id);

    return {
      userId: student.id,
      nome: student.nome,
      email: student.email,
      esperimenti: mySessions
        .filter(s => s.session_type === 'experiment')
        .map(s => ({
          experimentId: s.experiment_id,
          nome: s.experiment_id,
          completato: s.completed,
          durata: s.duration_seconds,
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          timestamp: s.started_at,
        })),
      sessioni: mySessions.map(s => ({
        id: s.id,
        inizio: s.started_at,
        fine: s.ended_at,
        durata: s.duration_seconds || 0,
        attivita: s.activity || [],
      })),
      moods: myMoods.map(m => ({
        mood: m.mood,
        nota: m.context || '',
        timestamp: m.created_at,
      })),
      confusione: [],
      meraviglie: [],
      concetti: [],
      stats: {
        esperimentiTotali: mySessions.filter(s => s.completed).length,
        tempoTotale: mySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
        tempoMedioSessione: mySessions.length > 0
          ? Math.round(mySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / mySessions.length)
          : 0,
      },
      tempoTotale: mySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
      _source: 'supabase',
    };
  });
}

// ─── Helpers ───

async function getClassStudentIds(classId) {
  const { data } = await supabase
    .from('class_students')
    .select('student_id')
    .eq('class_id', classId);
  return (data || []).map(r => r.student_id);
}

/**
 * Controlla se ci sono dati Supabase disponibili.
 * Utile per decidere se mostrare badge "dati dal cloud" nella dashboard.
 */
export function isCloudDataAvailable() {
  return isSupabaseConfigured();
}
