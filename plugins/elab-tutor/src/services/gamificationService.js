/**
 * Gamification Service — Punti, Badge, Streak
 * Gli effetti celebrativi audio/visivi sono disattivati: in lavagna disturbano
 * e possono partire quando una sessione viene solo aperta/ripristinata.
 * © Andrea Marro — 01/04/2026
 */

const POINTS_KEY = 'elab_gamification_points';
const STREAK_KEY = 'elab_gamification_streak';
const BADGES_KEY = 'elab_gamification_badges';
const CELEBRATION_EFFECTS_ENABLED = false;

// ─── Points system ───────────────────────────────
const POINT_VALUES = {
  experimentCompleted: 10,
  quizCorrect: 5,
  streakDay: 3,
  firstExperiment: 20,
  gameWon: 8,
};

function getPoints() {
  try { return JSON.parse(localStorage.getItem(POINTS_KEY) || '{"total":0,"history":[]}'); }
  catch { return { total: 0, history: [] }; }
}

function addPoints(amount, reason) {
  const data = getPoints();
  data.total += amount;
  data.history.push({ amount, reason, ts: Date.now() });
  // Keep only last 200 entries
  if (data.history.length > 200) data.history = data.history.slice(-200);
  try { localStorage.setItem(POINTS_KEY, JSON.stringify(data)); } catch { /* ok */ }
  return data.total;
}

function getTotalPoints() {
  return getPoints().total;
}

// ─── Streak system ───────────────────────────────
function getStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"current":0,"lastDate":null,"best":0}'); }
  catch { return { current: 0, lastDate: null, best: 0 }; }
}

function updateStreak() {
  const streak = getStreak();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (streak.lastDate === today) return streak; // Already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (streak.lastDate === yesterday) {
    streak.current += 1;
  } else {
    streak.current = 1; // Reset streak
  }

  streak.lastDate = today;
  streak.best = Math.max(streak.best, streak.current);
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(streak)); } catch { /* ok */ }
  return streak;
}

// ─── Badge system ───────────────────────────────
const BADGE_DEFS = [
  { id: 'first-experiment', name: 'Primo Passo', desc: 'Completa il primo esperimento', icon: 'star', check: (ctx) => ctx.experiments >= 1 },
  { id: 'exp-5', name: 'Esploratore', desc: 'Completa 5 esperimenti', icon: 'flask', check: (ctx) => ctx.experiments >= 5 },
  { id: 'exp-10', name: 'Scienziato', desc: 'Completa 10 esperimenti', icon: 'medal', check: (ctx) => ctx.experiments >= 10 },
  { id: 'exp-25', name: 'Inventore', desc: 'Completa 25 esperimenti', icon: 'trophy', check: (ctx) => ctx.experiments >= 25 },
  { id: 'exp-50', name: 'Maestro', desc: 'Completa 50 esperimenti', icon: 'crown', check: (ctx) => ctx.experiments >= 50 },
  { id: 'streak-3', name: 'Costante', desc: '3 giorni consecutivi', icon: 'fire', check: (ctx) => ctx.streak >= 3 },
  { id: 'streak-7', name: 'Inarrestabile', desc: '7 giorni consecutivi', icon: 'rocket', check: (ctx) => ctx.streak >= 7 },
  { id: 'quiz-master', name: 'Quiz Master', desc: '10 quiz corretti', icon: 'brain', check: (ctx) => ctx.quizzes >= 10 },
];

function getUnlockedBadges() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]'); }
  catch { return []; }
}

function checkAndUnlockBadges(context) {
  const unlocked = getUnlockedBadges();
  const newBadges = [];

  for (const badge of BADGE_DEFS) {
    if (!unlocked.includes(badge.id) && badge.check(context)) {
      unlocked.push(badge.id);
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    try { localStorage.setItem(BADGES_KEY, JSON.stringify(unlocked)); } catch { /* ok */ }
  }
  return newBadges;
}

function getAllBadges() {
  const unlocked = getUnlockedBadges();
  return BADGE_DEFS.map(b => ({ ...b, unlocked: unlocked.includes(b.id) }));
}

// ─── Sound effects via Web Audio API ───────────
let _audioCtx = null;

function _getAudioCtx() {
  if (!CELEBRATION_EFFECTS_ENABLED) return null;
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {});
  return _audioCtx;
}

function playBeep(frequency = 800, duration = 0.15, type = 'sine') {
  const ctx = _getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = 0.15;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playSuccess() {
  const ctx = _getAudioCtx();
  if (!ctx) return;
  // Two ascending notes
  [523, 659].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1 * (i + 1) + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + 0.1 * i);
    osc.stop(ctx.currentTime + 0.1 * i + 0.2);
  });
}

function playError() {
  playBeep(300, 0.2, 'sawtooth');
}

function playFanfare() {
  const ctx = _getAudioCtx();
  if (!ctx) return;
  // C-E-G-C ascending fanfare
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12 * (i + 1) + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + 0.12 * i);
    osc.stop(ctx.currentTime + 0.12 * i + 0.35);
  });
}

function playBadgeUnlock() {
  const ctx = _getAudioCtx();
  if (!ctx) return;
  // Sparkle: rapid ascending notes
  [880, 1109, 1319, 1760].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08 * (i + 1) + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + 0.08 * i);
    osc.stop(ctx.currentTime + 0.08 * i + 0.25);
  });
}

// ─── Timer tracking ──────────────────────────────
let _confettiTimer = null;
let _badgeUnlockTimer = null;

// ─── Confetti ──────────────────────────────────
function showConfetti(container) {
  if (!CELEBRATION_EFFECTS_ENABLED) return;
  if (typeof document === 'undefined') return;
  const el = container || document.body;
  const colors = ['#1E4D8C', '#4A7A25', '#E8941C', '#E54B3D', '#FFD700'];
  const count = 50;
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;overflow:hidden';
  wrapper.setAttribute('aria-hidden', 'true');
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    const size = 6 + Math.random() * 6;
    const x = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 1.5 + Math.random() * 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotation = Math.random() * 360;
    piece.style.cssText = `position:absolute;top:-10px;left:${x}%;width:${size}px;height:${size * 0.6}px;background:${color};transform:rotate(${rotation}deg);animation:elabConfettiFall ${duration}s ease-in ${delay}s forwards;border-radius:1px`;
    wrapper.appendChild(piece);
  }

  // Inject keyframes if not present
  if (!document.getElementById('elab-confetti-keyframes')) {
    const style = document.createElement('style');
    style.id = 'elab-confetti-keyframes';
    style.textContent = `@keyframes elabConfettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`;
    document.head.appendChild(style);
  }

  el.appendChild(wrapper);
  // Clear previous confetti timer if re-called quickly
  if (_confettiTimer) clearTimeout(_confettiTimer);
  _confettiTimer = setTimeout(() => { wrapper.remove(); _confettiTimer = null; }, 4000);
}

// ─── Orchestration: call these from components ──
function onExperimentCompleted(experimentId, isFirst = false) {
  const pts = isFirst ? POINT_VALUES.firstExperiment : POINT_VALUES.experimentCompleted;
  const total = addPoints(pts, `Esperimento ${experimentId}`);
  const streak = updateStreak();
  const newBadges = checkAndUnlockBadges({
    experiments: getPoints().history.filter(h => h.reason.startsWith('Esperimento')).length,
    streak: streak.current,
    quizzes: getPoints().history.filter(h => h.reason.startsWith('Quiz')).length,
  });
  return { total, newBadges, streak };
}

function onQuizCorrect(experimentId) {
  playSuccess();
  const total = addPoints(POINT_VALUES.quizCorrect, `Quiz ${experimentId}`);
  return total;
}

function onQuizWrong() {
  playError();
}

function onGameWon(gameId) {
  const total = addPoints(POINT_VALUES.gameWon, `Gioco ${gameId}`);
  return total;
}

/**
 * Teardown — clears all pending timers and audio context.
 * Call on component unmount or app teardown to prevent leaks.
 */
function teardown() {
  if (_confettiTimer) { clearTimeout(_confettiTimer); _confettiTimer = null; }
  if (_badgeUnlockTimer) { clearTimeout(_badgeUnlockTimer); _badgeUnlockTimer = null; }
  if (_audioCtx) {
    _audioCtx.close().catch(() => {});
    _audioCtx = null;
  }
}

export default {
  // Points
  getTotalPoints,
  getPoints,
  addPoints,
  POINT_VALUES,
  CELEBRATION_EFFECTS_ENABLED,
  // Streak
  getStreak,
  updateStreak,
  // Badges
  getAllBadges,
  getUnlockedBadges,
  checkAndUnlockBadges,
  BADGE_DEFS,
  // Sounds
  playSuccess,
  playError,
  playFanfare,
  playBadgeUnlock,
  playBeep,
  // Confetti
  showConfetti,
  // Orchestration
  onExperimentCompleted,
  onQuizCorrect,
  onQuizWrong,
  onGameWon,
  // Teardown
  teardown,
};
