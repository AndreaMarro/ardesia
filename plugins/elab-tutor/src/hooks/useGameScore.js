/**
 * useGameScore — Persists star scores per game in localStorage
 * © Andrea Marro — 20/02/2026
 */
import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'elab_game_stars_';

export default function useGameScore(gameKey) {
  const storageKey = STORAGE_PREFIX + gameKey;

  const [scores, setScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
    catch { return {}; }
  });

  const saveScore = useCallback((itemId, stars) => {
    setScores(prev => {
      const existing = prev[itemId] || 0;
      // Keep best score
      const best = Math.max(existing, stars);
      const next = { ...prev, [itemId]: best };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const getScore = useCallback((itemId) => scores[itemId] || 0, [scores]);

  const getAllScores = useCallback(() => Object.values(scores), [scores]);

  return { scores, saveScore, getScore, getAllScores };
}
