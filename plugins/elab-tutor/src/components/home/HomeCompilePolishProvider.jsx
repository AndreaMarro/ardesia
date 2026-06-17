/* © Andrea Marro — 29/05/2026 — ELAB Tutor — Tutti i diritti riservati */
/**
 * HomeCompilePolishProvider — Swarm 4 Visual Polish + Morfismo wrapper.
 *
 * Andrea verbatim mandate iter-2026-05-29 swarm-4:
 *   "bellissima moltissimo". Beyond layout, this swarm adds:
 *    - Micro-interactions + transitions
 *    - Mascot UNLIM animation states (idle, listening, thinking, speaking)
 *    - Morfismo-coherent illustrations derived from Volumi cartacei
 *    - Loading shimmers, skeleton states
 *    - Sound design (subtle UI sounds, optional toggle)
 *
 * What it does:
 *  1. Injects Swarm 4 CSS animation tokens onto its root element via
 *     `style={buildPolishStyleObject()}` — exposes them as CSS custom
 *     props so consumers reference them by name (no JS coupling).
 *  2. Mirrors prefers-reduced-motion at the JS layer: when reduced
 *     motion is requested, durations collapse to 1ms even for
 *     JS-driven animations.
 *  3. Manages the sound mute toggle persisted to localStorage
 *     (`elab_home_compile_sound_muted`). No actual audio shipped in
 *     this swarm — contract only, sounds wired by a follow-up atom.
 *  4. Imports the polish CSS once for the whole route.
 *
 * Wrapping convention (single-author merge by orchestrator):
 *   <HomeCompilePolishProvider>
 *     <HomeCompileLayoutV2>...</HomeCompileLayoutV2>
 *   </HomeCompilePolishProvider>
 *
 * Anti-regression / disjoint ownership rules:
 *  - This file ONLY wires CSS variables, listens to media-query,
 *    persists the sound toggle. NO logic that touches
 *    HomeCompileEntry.jsx or any Swarm 1/2/3 file.
 *  - Polish CSS classes are namespaced `.hcPolish*` so they cannot
 *    clash with CSS modules owned by other swarms.
 *
 * Morfismo Sense 1.5 — the provider scope IS the morphic surface:
 * children render with palette-coherent animation tokens that match
 * the printed volumi cartacei rhythm (Lego Education + Khan Academy
 * reference per .impeccable.md, NOT Material/Disney/Salesforce/RGB).
 */

import React, { useEffect, useMemo, useState, createContext, useContext, useCallback } from 'react';
import {
  buildPolishStyleObject,
  applyReducedMotionTokens,
  prefersReducedMotion as detectReducedMotion,
  SOUND_DESIGN,
} from '../../utils/homeCompileAnimationTokens';
import '../../styles/home-compile-polish.css';

/**
 * Public context for descendant components.
 * Exposes:
 *  - reducedMotion: boolean, mirrors media-query
 *  - soundMuted: boolean, mirrors localStorage
 *  - setSoundMuted: (next: boolean) => void
 *  - playCue: (eventName: string) => void — no-op in this swarm
 *    (audio files not shipped). Stable identity for memoization.
 */
const HomeCompilePolishContext = createContext({
  reducedMotion: false,
  soundMuted: false,
  setSoundMuted: () => {},
  playCue: () => {},
});

/**
 * Read mute preference from localStorage. Defensive — wrapped in
 * try/catch so private browsing / quota errors do not crash mount.
 */
function readSoundMuted() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage?.getItem(SOUND_DESIGN.storageKey);
    return raw === 'true';
  } catch {
    return false;
  }
}

function writeSoundMuted(next) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(SOUND_DESIGN.storageKey, next ? 'true' : 'false');
  } catch {
    /* localStorage may be quota-full or disabled — silent no-op */
  }
}

export default function HomeCompilePolishProvider({ children, className }) {
  /**
   * reducedMotion: live tracking of prefers-reduced-motion media query.
   * The CSS @media @prefers-reduced-motion: reduce block in
   * home-compile-polish.css already disables pure-CSS keyframes.
   * This JS-level mirror lets us collapse JS-driven durations too.
   */
  const [reducedMotion, setReducedMotion] = useState(() => detectReducedMotion());

  /**
   * soundMuted: persisted to localStorage per task brief —
   *   "Sound design: optional <audio> elements with mute toggle
   *    persisted to localStorage."
   */
  const [soundMuted, setSoundMutedState] = useState(() => readSoundMuted());

  /* live update on media-query change */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    let mq;
    try {
      mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    } catch {
      return undefined;
    }
    const handler = (event) => setReducedMotion(Boolean(event.matches));
    /* Safari < 14 uses addListener instead of addEventListener */
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
    return undefined;
  }, []);

  const setSoundMuted = useCallback((next) => {
    const normalized = Boolean(next);
    setSoundMutedState(normalized);
    writeSoundMuted(normalized);
  }, []);

  /**
   * playCue: stable no-op stub. Sound assets not shipped in Swarm 4.
   * Defined here so consumers can wire `onClick={() => playCue('buttonPress')}`
   * today and the implementation lands transparently in a follow-up.
   *
   * Reason no audio in Swarm 4:
   *  - "no new asset > 200 KB" task constraint
   *  - no licensed audio source in /public/assets/home-compile/
   *  - Sound design is OPTIONAL per task brief, contract more
   *    important than premature implementation
   */
  const playCue = useCallback((/* eventName */) => {
    if (soundMuted) return;
    /* intentional no-op: Swarm 4 ships contract, not audio binaries */
  }, [soundMuted]);

  /**
   * Materialize CSS tokens.
   *  - Always inject the full set.
   *  - When reduced-motion is on, collapse durations to 1ms so any
   *    consumer reading `var(--hc-polish-duration-normal)` from JS
   *    via getComputedStyle gets the reduced value.
   */
  const styleVars = useMemo(() => {
    const base = buildPolishStyleObject();
    return reducedMotion ? applyReducedMotionTokens(base) : base;
  }, [reducedMotion]);

  const ctxValue = useMemo(
    () => ({ reducedMotion, soundMuted, setSoundMuted, playCue }),
    [reducedMotion, soundMuted, setSoundMuted, playCue],
  );

  /* CSS class hcPolishScope is the single entry point CSS rules
     target. Any rule in home-compile-polish.css that should only
     apply inside this provider scope MUST be nested under
     `.hcPolishScope`. */
  const rootClass = className
    ? `hcPolishScope ${className}`
    : 'hcPolishScope';

  return (
    <HomeCompilePolishContext.Provider value={ctxValue}>
      <div
        className={rootClass}
        style={styleVars}
        data-hc-polish="v1"
        data-hc-reduced-motion={reducedMotion ? 'true' : 'false'}
        data-hc-sound-muted={soundMuted ? 'true' : 'false'}
      >
        {children}
      </div>
    </HomeCompilePolishContext.Provider>
  );
}

/**
 * Hook for descendants to read polish state + dispatch sound cues.
 * Safe to call outside the provider — returns the default no-op
 * context so unwrapped consumers (e.g. unit tests) do not crash.
 */
export function useHomeCompilePolish() {
  return useContext(HomeCompilePolishContext);
}

export { HomeCompilePolishContext };
