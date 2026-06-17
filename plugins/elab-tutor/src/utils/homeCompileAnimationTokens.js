/* © Andrea Marro — 29/05/2026 — ELAB Tutor — Tutti i diritti riservati */
/**
 * homeCompileAnimationTokens — Swarm 4 Visual Polish + Morfismo (2026-05-29).
 *
 * Centralized animation tokens for the HomeCompile route (#compile-home).
 *
 * Why a JS module beside the CSS:
 *  - CSS custom properties exposed once via HomeCompilePolishProvider —
 *    a JSON-style source of truth shared between CSS keyframes and JS
 *    consumers (e.g. setTimeout-based fallback animations, sound cues).
 *  - prefers-reduced-motion is enforced in CSS via @media query and
 *    mirrored here via `applyReducedMotionTokens()` so any JS-driven
 *    animation can collapse durations to 1ms without forking code paths.
 *
 * Andrea verbatim mandate iter-2026-05-29 swarm-4 task brief:
 *   "respect WCAG prefers-reduced-motion (disable animations when set).
 *    All timings via tokens file."
 *
 * Anti-pattern: NO hard-coded ms durations in CSS module or component
 * inline style for animation. NO "300ms ease" string scattered around —
 * use the tokens.
 *
 * Morfismo Sense 1.5: tokens map 1:1 with --color-vol1/vol2/vol3 palette
 * so success/warning/error states stay coherent with volumi cartacei
 * (kit-coupled didactic aesthetic, Lego Education + Khan Academy +
 * volumi cartacei reference per .impeccable.md anti-references).
 */

/**
 * Duration tokens (milliseconds).
 *
 * Tiers:
 *   - micro: button press feedback (≤120ms — perceptually "immediate"
 *     per Nielsen Norman 100ms rule)
 *   - fast: hover transitions (150-180ms)
 *   - normal: morph + skeleton fade (260-320ms — Material/iOS norm)
 *   - slow: success ribbon reveal + mascot speech bubble (440-520ms)
 *   - breathe: idle ambient (3-5s — sub-conscious presence, no
 *     attention grab — Lego Education reference)
 *   - shimmer: skeleton loading sweep (1.2s — readable cadence,
 *     Khan Academy reference)
 */
export const DURATIONS = Object.freeze({
  micro: 120,
  fast: 180,
  normal: 280,
  slow: 480,
  breathe: 3600,
  shimmer: 1200,
  morph: 320,
  pulse: 1800,
});

/**
 * Easing tokens. Curves chosen to avoid "SaaS Material" bounce and
 * "Disney cartoon" overshoot (anti-reference per .impeccable.md).
 *
 *   - outSoft: standard expressive curve, doesn't overshoot (Lego
 *     Education aesthetic — "gentle confidence", no Disney bounce)
 *   - inOut: balanced symmetric for morph (compile spinner → success
 *     check). Avoids the asymmetric "snap" feel of pure easeOut.
 *   - spring: subtle controlled overshoot for celebratory micro-moments
 *     (compile success ribbon). MAX overshoot ~6% — anti-RGB-gaming.
 *   - linear: shimmer + progress bars where the user reads progression.
 */
export const EASINGS = Object.freeze({
  outSoft: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.26, 0.64, 1)',
  linear: 'cubic-bezier(0, 0, 1, 1)',
  outBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
});

/**
 * Composite tokens: predefined "duration + easing" pairs for the most
 * common HomeCompile transitions. Consumers prefer these over manual
 * combinations so the visual language stays coherent.
 */
export const TRANSITIONS = Object.freeze({
  buttonPress: `transform ${DURATIONS.micro}ms ${EASINGS.outSoft}, background-color ${DURATIONS.micro}ms ${EASINGS.outSoft}`,
  panelHover: `box-shadow ${DURATIONS.fast}ms ${EASINGS.outSoft}, transform ${DURATIONS.fast}ms ${EASINGS.outSoft}`,
  morph: `all ${DURATIONS.morph}ms ${EASINGS.inOut}`,
  ribbonReveal: `transform ${DURATIONS.slow}ms ${EASINGS.spring}, opacity ${DURATIONS.normal}ms ${EASINGS.outSoft}`,
  skeletonFade: `opacity ${DURATIONS.normal}ms ${EASINGS.outSoft}`,
});

/**
 * Mascot animation timing per compile state.
 * Mirrors the CSS keyframes in `home-compile-polish.css` so that
 * any JS consumer (e.g. screen-reader announcement debounce) can
 * align with the visible motion.
 *
 * iter-102 mascot Vera animation precedent in
 * UnlimCompileHelper.module.css — we EXTEND that vocabulary into
 * the polish layer, no override.
 */
export const MASCOT_STATES = Object.freeze({
  idle: { duration: DURATIONS.breathe, easing: EASINGS.inOut, iterations: Infinity },
  listening: { duration: 1400, easing: EASINGS.outSoft, iterations: Infinity },
  thinking: { duration: 950, easing: EASINGS.inOut, iterations: Infinity },
  speaking: { duration: 760, easing: EASINGS.outSoft, iterations: Infinity },
  celebrating: { duration: 550, easing: EASINGS.spring, iterations: 2 },
  concerned: { duration: 400, easing: EASINGS.inOut, iterations: 2 },
});

/**
 * Sound design tokens (P0 scaffold).
 *
 * Note: no actual audio files shipped iter swarm-4 — would risk >200KB
 * asset budget per task brief constraint. The contract is published
 * here so Swarm 3 (UNLIM chat) or a follow-up atom can hook in.
 *
 * Volume: 0..1 normalized. Default 0.35 — discreet, not arcade.
 * Mute persisted to localStorage key `elab_home_compile_sound_muted`.
 */
export const SOUND_DESIGN = Object.freeze({
  storageKey: 'elab_home_compile_sound_muted',
  defaultVolume: 0.35,
  events: {
    buttonPress: { /* placeholder — no audio shipped */ volume: 0.18 },
    compileStart: { volume: 0.35 },
    compileSuccess: { volume: 0.45 },
    compileError: { volume: 0.40 },
    uploadStart: { volume: 0.35 },
    uploadSuccess: { volume: 0.50 },
  },
});

/**
 * CSS variable names exported by HomeCompilePolishProvider on
 * the route root. Components consuming Swarm 4 polish reference
 * these names in their own CSS rather than hard-coding numbers.
 *
 * Example consumer (Swarm 2 layout CSS):
 *   .myButton:active {
 *     transition: var(--hc-polish-transition-button-press);
 *   }
 */
export const CSS_VAR_NAMES = Object.freeze({
  durationMicro: '--hc-polish-duration-micro',
  durationFast: '--hc-polish-duration-fast',
  durationNormal: '--hc-polish-duration-normal',
  durationSlow: '--hc-polish-duration-slow',
  durationBreathe: '--hc-polish-duration-breathe',
  durationShimmer: '--hc-polish-duration-shimmer',
  durationMorph: '--hc-polish-duration-morph',
  durationPulse: '--hc-polish-duration-pulse',
  easeOutSoft: '--hc-polish-ease-out-soft',
  easeInOut: '--hc-polish-ease-in-out',
  easeSpring: '--hc-polish-ease-spring',
  easeLinear: '--hc-polish-ease-linear',
  easeOutBack: '--hc-polish-ease-out-back',
  transitionButtonPress: '--hc-polish-transition-button-press',
  transitionPanelHover: '--hc-polish-transition-panel-hover',
  transitionMorph: '--hc-polish-transition-morph',
  transitionRibbon: '--hc-polish-transition-ribbon',
  transitionSkeleton: '--hc-polish-transition-skeleton',
});

/**
 * Build the inline `style` object that HomeCompilePolishProvider
 * injects on its root element. We materialize each token as a CSS
 * custom property so the polish CSS can reference them by name
 * without coupling to JS at runtime.
 */
export function buildPolishStyleObject() {
  return {
    [CSS_VAR_NAMES.durationMicro]: `${DURATIONS.micro}ms`,
    [CSS_VAR_NAMES.durationFast]: `${DURATIONS.fast}ms`,
    [CSS_VAR_NAMES.durationNormal]: `${DURATIONS.normal}ms`,
    [CSS_VAR_NAMES.durationSlow]: `${DURATIONS.slow}ms`,
    [CSS_VAR_NAMES.durationBreathe]: `${DURATIONS.breathe}ms`,
    [CSS_VAR_NAMES.durationShimmer]: `${DURATIONS.shimmer}ms`,
    [CSS_VAR_NAMES.durationMorph]: `${DURATIONS.morph}ms`,
    [CSS_VAR_NAMES.durationPulse]: `${DURATIONS.pulse}ms`,
    [CSS_VAR_NAMES.easeOutSoft]: EASINGS.outSoft,
    [CSS_VAR_NAMES.easeInOut]: EASINGS.inOut,
    [CSS_VAR_NAMES.easeSpring]: EASINGS.spring,
    [CSS_VAR_NAMES.easeLinear]: EASINGS.linear,
    [CSS_VAR_NAMES.easeOutBack]: EASINGS.outBack,
    [CSS_VAR_NAMES.transitionButtonPress]: TRANSITIONS.buttonPress,
    [CSS_VAR_NAMES.transitionPanelHover]: TRANSITIONS.panelHover,
    [CSS_VAR_NAMES.transitionMorph]: TRANSITIONS.morph,
    [CSS_VAR_NAMES.transitionRibbon]: TRANSITIONS.ribbonReveal,
    [CSS_VAR_NAMES.transitionSkeleton]: TRANSITIONS.skeletonFade,
  };
}

/**
 * Reduced-motion override: collapses all duration tokens to 1ms.
 * Use when a JS consumer schedules an animation with setTimeout +
 * needs to honor prefers-reduced-motion (CSS @media already covers
 * pure-CSS keyframes).
 */
export function applyReducedMotionTokens(style) {
  const collapsed = { ...style };
  [
    CSS_VAR_NAMES.durationMicro,
    CSS_VAR_NAMES.durationFast,
    CSS_VAR_NAMES.durationNormal,
    CSS_VAR_NAMES.durationSlow,
    CSS_VAR_NAMES.durationBreathe,
    CSS_VAR_NAMES.durationShimmer,
    CSS_VAR_NAMES.durationMorph,
    CSS_VAR_NAMES.durationPulse,
  ].forEach((key) => {
    collapsed[key] = '1ms';
  });
  return collapsed;
}

/**
 * Detect the user's reduced-motion preference. Returns false in
 * non-browser environments (SSR / Vitest jsdom default) so consumers
 * can render without crashing.
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

const tokens = {
  DURATIONS,
  EASINGS,
  TRANSITIONS,
  MASCOT_STATES,
  SOUND_DESIGN,
  CSS_VAR_NAMES,
  buildPolishStyleObject,
  applyReducedMotionTokens,
  prefersReducedMotion,
};

export default tokens;
