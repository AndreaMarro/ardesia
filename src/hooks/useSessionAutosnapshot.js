/**
 * ELAB — useSessionAutosnapshot (Goal B B4)
 *
 * Hook React: snapshotta la sessione corrente in localStorage ogni 30s
 * mentre il componente è montato. Bounded: tiene al massimo
 * MAX_SNAPSHOTS_PER_EXP=5 snapshot per esperimento, purga il più vecchio in
 * caso di QuotaExceededError e ritenta una sola volta.
 *
 * Schema chiave: `${SNAPSHOT_KEY_PREFIX}${experimentId}-${Date.now()}`
 * Schema valore: stringa JSON prodotta da exportSessionAsJSON (schema v1.0).
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { useEffect, useRef } from 'react';
import { exportSessionAsJSON } from '../services/sessionExporter.js';
import logger from '../utils/logger.js';

export const SNAPSHOT_INTERVAL_MS = 30_000;
export const SNAPSHOT_KEY_PREFIX = 'elab-session-snapshot-';
export const MAX_SNAPSHOTS_PER_EXP = 5;

/**
 * Riconosce QuotaExceededError cross-browser (name + legacy code 22 + Firefox 1014).
 */
function isQuotaError(err) {
  if (!err) return false;
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    err.code === 1014
  );
}

/**
 * Elenca le chiavi snapshot di un dato experimentId, ordinate per timestamp
 * crescente (la prima è la più vecchia). Le chiavi malformate sono ignorate.
 */
function listSnapshotKeys(experimentId) {
  if (typeof localStorage === 'undefined') return [];
  const prefix = `${SNAPSHOT_KEY_PREFIX}${experimentId}-`;
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      const tsStr = k.slice(prefix.length);
      const ts = Number(tsStr);
      if (Number.isFinite(ts)) items.push({ key: k, ts });
    }
  }
  items.sort((a, b) => a.ts - b.ts);
  return items;
}

/**
 * Mantiene al più `maxKeep` snapshot per `experimentId`, cancellando i più vecchi.
 */
function pruneSnapshots(experimentId, maxKeep = MAX_SNAPSHOTS_PER_EXP) {
  const items = listSnapshotKeys(experimentId);
  if (items.length <= maxKeep) return;
  const removeCount = items.length - maxKeep;
  for (let i = 0; i < removeCount; i++) {
    try { localStorage.removeItem(items[i].key); } catch { /* ignore */ }
  }
}

/**
 * Scrive in localStorage con recupero quota: in caso di QuotaExceededError
 * cancella lo snapshot più vecchio per `experimentId` e ritenta una volta.
 */
function safeSetItem(key, json, experimentId) {
  try {
    localStorage.setItem(key, json);
    return true;
  } catch (err) {
    if (isQuotaError(err)) {
      const items = listSnapshotKeys(experimentId);
      const oldest = items[0];
      if (oldest && oldest.key !== key) {
        try { localStorage.removeItem(oldest.key); } catch { /* ignore */ }
      }
      try {
        localStorage.setItem(key, json);
        return true;
      } catch (retryErr) {
        logger.error('[useSessionAutosnapshot] retry after purge still failed', retryErr);
        return false;
      }
    }
    logger.error('[useSessionAutosnapshot] setItem failed', err);
    return false;
  }
}

/**
 * Hook: snapshotta la sessione corrente in localStorage ogni
 * SNAPSHOT_INTERVAL_MS mentre il componente è montato.
 *
 * @param {Object} opts
 * @param {boolean} [opts.enabled=true]
 * @param {string}  [opts.experimentId]  obbligatorio per costruire la chiave
 * @param {string}  [opts.modalita]      'passo-passo' | 'gia-montato' | 'percorso'
 */
export function useSessionAutosnapshot({ enabled = true, experimentId, modalita } = {}) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !experimentId) return undefined;
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return undefined;

    const tick = () => {
      try {
        const json = exportSessionAsJSON({ modalita, experimentMeta: { id: experimentId } });
        if (!json) return;
        const key = `${SNAPSHOT_KEY_PREFIX}${experimentId}-${Date.now()}`;
        const ok = safeSetItem(key, json, experimentId);
        if (ok) pruneSnapshots(experimentId, MAX_SNAPSHOTS_PER_EXP);
      } catch (err) {
        logger.error('[useSessionAutosnapshot] exportSessionAsJSON threw', err);
      }
    };

    intervalRef.current = setInterval(tick, SNAPSHOT_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, experimentId, modalita]);
}

export default useSessionAutosnapshot;
