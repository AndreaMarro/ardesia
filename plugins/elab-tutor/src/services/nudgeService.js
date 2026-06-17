/**
 * ELAB — Nudge Service
 * Delivery reale di nudge dal docente allo studente.
 * Canali: localStorage (cross-tab same device) + analytics webhook (audit trail).
 * © Andrea Marro — 30/03/2026 — G41
 */

import { sendAnalyticsEvent } from '../components/simulator/api/AnalyticsWebhook';
import { sendNudge as supabaseSendNudge, subscribeToNudges, markNudgeRead } from './supabaseSync';
import { isSupabaseConfigured } from './supabaseClient';

const NUDGE_KEY = 'elab-nudge-pending';
const NUDGE_READ_KEY = 'elab-nudge-read';
const POLL_INTERVAL = 3000; // 3s polling for student side
const BC_CHANNEL_NAME = 'elab-nudge-channel';

// BroadcastChannel for instant same-origin cross-tab delivery (faster than storage events)
let _broadcastChannel = null;
function _getBroadcastChannel() {
  if (_broadcastChannel) return _broadcastChannel;
  try {
    _broadcastChannel = new BroadcastChannel(BC_CHANNEL_NAME);
    return _broadcastChannel;
  } catch {
    return null; // BroadcastChannel not supported (Safari < 15.4)
  }
}

/**
 * Send a nudge from teacher to student.
 * Stores in localStorage for cross-tab delivery + fires analytics event.
 * @param {string} studentId
 * @param {string} studentName
 * @param {string} message
 * @param {object} [options] - { classId, teacherId }
 * @returns {{ id: string, timestamp: string }}
 */
export function sendNudge(studentId, studentName, message, options = {}) {
  const nudge = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    studentId,
    // GDPR: studentName NOT stored in localStorage (PII minimization for minors)
    message,
    timestamp: new Date().toISOString(),
    from: 'teacher',
  };

  // 1. Store in localStorage for same-device cross-tab delivery
  try {
    const pending = JSON.parse(localStorage.getItem(NUDGE_KEY) || '[]');
    pending.push(nudge);
    // Keep max 50 pending nudges to prevent storage bloat
    if (pending.length > 50) pending.splice(0, pending.length - 50);
    localStorage.setItem(NUDGE_KEY, JSON.stringify(pending));
  } catch {
    // localStorage may be full or unavailable
  }

  // 2. Broadcast via BroadcastChannel for instant same-origin delivery
  const bc = _getBroadcastChannel();
  if (bc) {
    try { bc.postMessage({ type: 'nudge', nudge }); } catch { /* silent */ }
  }

  // 3. Send to backend analytics webhook for audit trail
  sendAnalyticsEvent('teacher_nudge_sent', {
    studentId,
    message,
    nudgeId: nudge.id,
  });

  // 4. G49: Send via Supabase for cross-device delivery
  if (isSupabaseConfigured()) {
    supabaseSendNudge({
      student_id: studentId,
      message,
      class_id: options.classId || null,
      teacher_id: options.teacherId || null,
    }).catch(() => {});
  }

  return nudge;
}

/**
 * Get pending nudges for a specific student and clear them.
 * Called from student side to consume nudges.
 * @param {string} studentId
 * @returns {Array<{ id: string, message: string, timestamp: string }>}
 */
export function consumeNudges(studentId) {
  try {
    const pending = JSON.parse(localStorage.getItem(NUDGE_KEY) || '[]');
    const mine = pending.filter(n => n.studentId === studentId);
    if (mine.length === 0) return [];

    // Remove consumed nudges
    const remaining = pending.filter(n => n.studentId !== studentId);
    localStorage.setItem(NUDGE_KEY, JSON.stringify(remaining));

    // Track read nudge IDs to prevent re-showing
    const readIds = JSON.parse(localStorage.getItem(NUDGE_READ_KEY) || '[]');
    const newIds = mine.map(n => n.id).filter(id => !readIds.includes(id));
    if (newIds.length > 0) {
      const updatedRead = [...readIds, ...newIds].slice(-100); // Keep last 100
      localStorage.setItem(NUDGE_READ_KEY, JSON.stringify(updatedRead));
    }

    // Only return truly new nudges
    return mine.filter(n => !readIds.includes(n.id));
  } catch {
    return [];
  }
}

/**
 * Start polling for nudges on the student side.
 * Uses a lock flag to prevent double-delivery race between polling and storage events.
 * @param {string} studentId
 * @param {(nudges: Array) => void} onNudge - callback when nudges arrive
 * @returns {() => void} cleanup function
 */
export function startNudgeListener(studentId, onNudge) {
  if (!studentId) return () => {};

  let checking = false;
  const check = () => {
    if (checking) return; // Prevent race between poll and storage event
    checking = true;
    try {
      const nudges = consumeNudges(studentId);
      if (nudges.length > 0) onNudge(nudges);
    } finally {
      checking = false;
    }
  };

  // Check immediately
  check();

  // Poll every 3s
  const interval = setInterval(check, POLL_INTERVAL);

  // Also listen for storage events (cross-tab instant delivery)
  const onStorage = (e) => {
    if (e.key === NUDGE_KEY) check();
  };
  window.addEventListener('storage', onStorage);

  // BroadcastChannel listener for instant same-origin delivery
  const bc = _getBroadcastChannel();
  let bcHandler = null;
  if (bc) {
    bcHandler = (e) => {
      if (e.data?.type === 'nudge' && e.data.nudge?.studentId === studentId) {
        onNudge([e.data.nudge]);
      }
    };
    bc.addEventListener('message', bcHandler);
  }

  // G49: Supabase realtime subscription for cross-device nudges
  let supabaseUnsub;
  if (isSupabaseConfigured()) {
    const sub = subscribeToNudges(studentId, (nudge) => {
      onNudge([{ id: nudge.id, message: nudge.message, timestamp: nudge.created_at }]);
      markNudgeRead(nudge.id).catch(() => {});
    });
    supabaseUnsub = sub.unsubscribe;
  }

  return () => {
    clearInterval(interval);
    window.removeEventListener('storage', onStorage);
    if (bc && bcHandler) bc.removeEventListener('message', bcHandler);
    supabaseUnsub?.();
  };
}
