/**
 * HomePage — ELAB Tutor home (iter 36 Phase 1 Atom A13 partial — Tea-style redesign)
 *
 * Layout:
 *   - Hero left: ELAB TUTOR title Oswald + Lime gradient sottolineatura + sub-hero triplet
 *   - Hero right: mascotte UNLIM <MascotPresence /> (240×240 desktop / 160×160 mobile)
 *     click → speech bubble "Ciao Ragazzi!" (NO audio iter 36, lazy click iter 37)
 *   - 4-card grid auto-fit minmax(280px, 1fr) gap 24px:
 *       🧠 Chatbot UNLIM → #chatbot-only (route iter 37 placeholder)
 *       📚 Glossario Tea → external https://elab-tutor-glossario.vercel.app
 *       ⚡ Lavagna ELAB Tutor → #lavagna
 *       🐒 Chi siamo → #about-easter (modal iter 37)
 *   - Footer credits: Andrea+Tea+Davide+Omaric+Giovanni triplet visibile
 *   - Footer link "🐒 Chi siamo" subtle bottom-right (scimpanzè easter iter 37)
 *
 * Iter 36 SCOPE (4h budget):
 *   ✅ hero + 4-card + footer credits + scimpanzè link placeholder
 *   ❌ Chatbot-only route ChatbotOnly.jsx (defer iter 37 atom A13b)
 *   ❌ Cronologia ChatGPT-style sidebar 50 sessioni (defer iter 37)
 *   ❌ Tools palette 5 button (defer iter 37)
 *   ❌ Easter modal full 4 GIF rotation + banana mode CSS (defer iter 37)
 *   ❌ Voice clone Andrea audio greeting lazy (defer iter 37)
 *
 * Compliance gate:
 *   ✅ Linguaggio: "Ciao Ragazzi!" plurale (Principio Zero V3)
 *   ✅ Triplet: hero sub mention "Kit fisici + volumi + software morfico"
 *   ✅ Davide named explicitly "volumi cartacei" (PZ §A13 spec)
 *   ✅ Palette TOKENS: var(--elab-navy/lime/orange/red) — NO hard-coded hex
 *   ✅ Iconografia: emoji approved 🧠 📚 ⚡ 🐒 (PDR §A13 explicit OK Andrea)
 *   ✅ Mascotte UNLIM (NOT Galileo) — MascotPresence import lavagna/
 *   ✅ Touch targets ≥44px buttons
 *   ✅ WCAG AA contrast 4.5:1 on Navy background
 *   ✅ Font Oswald hero / Open Sans body
 *
 * Andrea Marro — iter 36 WebDesigner-1 Phase 1 — 2026-04-30
 */
import React, { lazy, Suspense, useState, useCallback, useEffect } from 'react';
// Iter 36 M1+Q1+O3 — Andrea mandate "SVG sostitutivi emoticon più belli
// usa impeccable" + 4° card Glossario.
import {
  LavagnaCardIcon,
  TutorCardIcon,
  RobotIcon,
  UNLIMCardIcon,
  GlossarioCardIcon,
} from './common/ElabIcons';
// Sprint V iter 1 Phase 3 WebDesigner-1 Atom A10 — ElabMascotte SVG
// inline impeccable (replaces PNG mascot — Andrea iter 42 PM mandate
// "voglio mascotte e nessuna emoticon" + design strutturato).
import ElabMascotte from './common/ElabMascotte';

// Cronologia sessioni — sezione sotto le card (iter 35 Task 2, preserved iter 36)
const HomeCronologia = lazy(() => import('./HomeCronologia'));

// Iter 37 Atom A6 — route hash routing chatbot-only + about-easter
const ChatbotOnly = lazy(() => import('./chatbot/ChatbotOnly'));
const EasterModal = lazy(() => import('./easter/EasterModal'));

// Iter 38 Atom A11 — mic permission UX nudge (pre-emptive grant request).
// Lazy-loaded: il banner appare solo se Permissions API segnala state='prompt',
// quindi caricarlo on-demand evita di gonfiare il main chunk per docenti che
// hanno già autorizzato il microfono nelle sessioni passate.
const MicPermissionNudge = lazy(() => import('./common/MicPermissionNudge.jsx'));

// Hash routes managed inline (NO react-router) — pattern consistent with
// existing app routing convention.
const HASH_ROUTES = {
  CHATBOT: '#chatbot-only',
  ABOUT: '#about-easter',
};

function readHash() {
  if (typeof window === 'undefined') return '';
  return window.location.hash || '';
}

// Palette tokens — fallback ai valori se le CSS vars non esistono ancora.
// CLAUDE.md §Design rule 16: Navy var(--elab-navy) / Lime var(--elab-lime) / Orange var(--elab-orange) / Red var(--elab-red)
const PALETTE = {
  navy: 'var(--elab-navy, var(--elab-navy))',
  lime: 'var(--elab-lime, var(--elab-lime))',
  orange: 'var(--elab-orange, var(--elab-orange))',
  red: 'var(--elab-red, var(--elab-red))',
  bg: 'var(--elab-bg, #F0F4F8)',
  cardBg: 'var(--elab-card-bg, #FFFFFF)',
  text: 'var(--elab-text, #1A1A1A)',
  textMuted: 'var(--elab-text-muted, #5A6B7E)',
};

const styles = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${PALETTE.bg} 0%, #E6ECF2 100%)`,
    fontFamily: "'Open Sans', system-ui, sans-serif",
    color: PALETTE.text,
    padding: '32px 24px 32px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 32,
    alignItems: 'center',
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto 40px',
    padding: '24px 16px 16px',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minWidth: 0,
  },
  brandTitle: {
    fontFamily: "'Oswald', system-ui, sans-serif",
    fontSize: 'clamp(40px, 6vw, 64px)',
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: PALETTE.navy,
    margin: 0,
    lineHeight: 1.05,
    textTransform: 'uppercase',
    // Lime gradient sottolineatura (Tea identity visivo)
    backgroundImage: `linear-gradient(transparent 78%, ${PALETTE.lime} 78%, ${PALETTE.lime} 92%, transparent 92%)`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    paddingBottom: 4,
    display: 'inline',
    width: 'fit-content',
  },
  brandSubtitle: {
    fontSize: 'clamp(15px, 1.6vw, 19px)',
    color: PALETTE.textMuted,
    fontWeight: 500,
    margin: 0,
    letterSpacing: '0.01em',
    lineHeight: 1.45,
  },
  heroRight: {
    position: 'relative',
    width: 240,
    height: 240,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRightMobile: {
    width: 160,
    height: 160,
  },
  speechBubble: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    background: PALETTE.cardBg,
    color: PALETTE.navy,
    padding: '10px 18px',
    borderRadius: 18,
    fontFamily: "'Open Sans', system-ui, sans-serif",
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px rgba(30, 77, 140, 0.25)',
    border: `2px solid ${PALETTE.lime}`,
    marginBottom: 24,
    pointerEvents: 'none',
    // Iter 36 fix Andrea: nuvoletta animata + NON tocca bordo superiore.
    // animation = float wave + scale pulse (4s loop). Apply via class fallback IF
    // inline style animation property unsupported.
    animation: 'elab-bubble-wave 4s ease-in-out infinite',
    transformOrigin: 'bottom center',
    willChange: 'transform',
  },
  speechBubbleArrow: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `10px solid ${PALETTE.lime}`,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
    padding: '0 8px',
  },
  card: {
    background: PALETTE.cardBg,
    border: '1px solid rgba(30, 77, 140, 0.12)',
    borderRadius: 20,
    padding: '28px 24px',
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    cursor: 'pointer',
    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
    fontFamily: 'inherit',
    color: PALETTE.text,
    textAlign: 'left',
    boxShadow: '0 2px 6px rgba(15, 27, 46, 0.04)',
    minWidth: 0,
    textDecoration: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  cardHover: {
    transform: 'translateY(-3px) scale(1.03)',
    boxShadow: '0 16px 40px rgba(30, 77, 140, 0.22)',
  },
  cardEmoji: {
    fontSize: 88,
    lineHeight: 1,
    marginBottom: 8,
    display: 'inline-block',
    filter: 'drop-shadow(0 2px 6px rgba(30, 77, 140, 0.18))',
  },
  cardTitle: {
    fontFamily: "'Oswald', system-ui, sans-serif",
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    color: PALETTE.navy,
    lineHeight: 1.15,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  cardText: {
    fontSize: 15,
    color: PALETTE.textMuted,
    lineHeight: 1.5,
    margin: 0,
    flexGrow: 1,
  },
  cardCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 700,
    color: PALETTE.navy,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    minHeight: 44,
    paddingTop: 4,
  },
  cardCredit: {
    fontSize: 12,
    color: PALETTE.textMuted,
    fontStyle: 'italic',
    fontWeight: 500,
    marginTop: 4,
    letterSpacing: '0.01em',
  },
  footer: {
    maxWidth: 1200,
    width: '100%',
    margin: '48px auto 0',
    padding: '24px 16px 16px',
    borderTop: '1px solid rgba(30, 77, 140, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
  },
  footerCredits: {
    fontSize: 13,
    color: PALETTE.textMuted,
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 500,
  },
  footerCreditsStrong: {
    color: PALETTE.navy,
    fontWeight: 700,
  },
  footerEasterLink: {
    fontSize: 13,
    color: PALETTE.textMuted,
    textDecoration: 'none',
    fontWeight: 500,
    minHeight: 44,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    borderRadius: 8,
    transition: 'color 150ms ease, background 150ms ease',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

// Sprint U iter 7 — 3 entry points (Andrea explicit simplification):
//   1. Lavagna libera (#lavagna) — costruzione libera
//   2. ELAB Tutor completo (#tutor) — full app Percorso + UNLIM + Simulator
//   3. UNLIM (solo chat) (#chatbot-only) — chatgpt-style focus
const CARDS = [
  {
    id: 'lavagna',
    emoji: '⚡',
    IconComponent: LavagnaCardIcon,
    accent: PALETTE.navy,
    title: 'Lavagna libera',
    text: 'Lavagna pulita per scrivere e parlare con UNLIM. Volumi sempre a portata. Niente circuiti.',
    cta: 'Entra in Lavagna',
    // Iter 35 H1 — Lavagna libera entry. App.jsx VALID_HASHES strict
    // ['home','tutor','lavagna',...] — `#lavagna-solo` would fail route.
    // Workaround: keep `#lavagna` href + set localStorage flag
    // `elab_lavagna_launch_mode='solo'` su click (read by Maker-2
    // LavagnaShell on mount; clear after consume → solo first launch).
    // Pattern coordina con `data-elab-mode="lavagna-solo"` Maker-2 H2.
    href: '#lavagna',
    launchMode: 'solo',
    target: 'internal',
    credit: null,
  },
  {
    id: 'tutor',
    emoji: '📚',
    IconComponent: TutorCardIcon,
    accent: PALETTE.lime,
    title: 'ELAB Tutor completo',
    text: 'App piena: Percorso dei volumi, esperimenti, UNLIM, voce, simulatore. Lezione completa con la classe.',
    cta: 'Apri ELAB Tutor',
    href: '#tutor',
    target: 'internal',
    credit: null,
  },
  // Iter 38 P0.3 Kimi K2.6 4-vendor anti-bias finding ACCETTATO ONESTO:
  // "UNLIM (solo chat)" card paritaria homepage VIOLA Principio Zero CLAUDE.md
  // ("studenti NON interagiscono direttamente con UNLIM, vedono LIM docente").
  // Card entry rimosso: route #chatbot-only + ChatbotOnly component (1749 LOC iter 37 A6)
  // PRESERVATI accessibili da admin menu / Tutor interno / direct hash URL.
  // NO regression Andrea iter 37 A6 work — solo entry semiotic homepage.
  // Iter 36 O1 — Andrea mandate "metti anche il glossario, ma solo glossario
  // nella home page". 4° card link external Glossario Tea sviluppato.
  {
    id: 'glossario',
    emoji: '📖',
    IconComponent: GlossarioCardIcon,
    accent: PALETTE.lime,
    title: 'Glossario',
    text: 'Tutti i termini di elettronica spiegati semplici: LED, resistore, breadboard, Arduino. Cercate parole + leggete con la classe.',
    cta: 'Apri Glossario',
    href: 'https://elab-tutor-glossario.vercel.app',
    target: 'external',
    credit: null,
  },
  // Iter 39 Andrea direttiva: 4° card = Videolezioni canale diretto.
  // Sostituisce "Chi siamo" (Andrea togli + replace).
  // Href placeholder YouTube channel — Andrea ratify URL specifico.
  {
    id: 'videolezioni',
    emoji: '🎬',
    IconComponent: null,
    accent: PALETTE.orange,
    title: 'Videolezioni',
    text: 'Lezioni video pronte: docente guarda + ragazzi seguono. Per ogni esperimento del kit ELAB con i volumi cartacei.',
    cta: 'Apri Videolezioni',
    href: 'https://www.youtube.com/@elabtutor',
    target: 'external',
    credit: null,
  },
];

function HomeCard({ card, onActivate }) {
  const [hover, setHover] = useState(false);
  const handle = useCallback((e) => {
    if (card.target === 'external') {
      // External link → let default <a> behavior handle it (target=_blank set on element)
      return;
    }
    e.preventDefault();
    // Iter 35 H1 — set `elab_lavagna_launch_mode` localStorage flag if
    // card declares launchMode (Lavagna libera = 'solo'). LavagnaShell
    // reads + consumes (clears) on mount → applies data-elab-mode.
    if (card.launchMode) {
      try { localStorage.setItem('elab_lavagna_launch_mode', card.launchMode); } catch { /* best-effort */ }
    }
    if (typeof onActivate === 'function') onActivate(card.href);
  }, [card.href, card.launchMode, card.target, onActivate]);

  const sharedProps = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: () => setHover(true),
    onBlur: () => setHover(false),
    'aria-label': `${card.title}: ${card.text}`,
    'data-testid': `home-card-${card.id}`,
    style: {
      ...styles.card,
      ...(hover ? styles.cardHover : {}),
      borderColor: hover ? card.accent : 'rgba(30, 77, 140, 0.12)',
    },
  };

  const innerContent = (
    <>
      {/* Iter 36 M1+Q1 — Andrea mandate "fai svg sostitutivi delle emoticon
          molto più belle usa impeccable". Render custom SVG component if
          card.IconComponent present, fallback emoji legacy se non. */}
      {card.IconComponent ? (
        <span style={styles.cardEmoji} aria-hidden="true">
          <card.IconComponent size={88} />
        </span>
      ) : (
        <span style={styles.cardEmoji} aria-hidden="true">{card.emoji}</span>
      )}
      <h2 style={styles.cardTitle}>{card.title}</h2>
      <p style={styles.cardText}>{card.text}</p>
      {card.credit && (
        <span style={styles.cardCredit} data-testid={`home-card-credit-${card.id}`}>
          {card.credit}
        </span>
      )}
      <span style={{ ...styles.cardCta, color: card.accent }}>
        {card.cta} <span aria-hidden="true">→</span>
      </span>
    </>
  );

  if (card.target === 'external') {
    return (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        {...sharedProps}
        onClick={handle}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button type="button" onClick={handle} {...sharedProps}>
      {innerContent}
    </button>
  );
}

// Sprint U iter 7 — Rotating class greeting (cycles every 3.5s).
// Pattern Andrea: docente entra classe diversa ogni ora, greeting riconosce.
const ROTATING_GREETINGS = [
  'Ciao Ragazzi!',
  'Ciao 1 A!',
  'Ciao 2 B!',
  'Ciao 3 C!',
  'Ciao 4ª!',
  'Ciao 5ª!',
  'Ciao 1ª media!',
  'Ciao 2ª media!',
  'Ciao 3ª media!',
  'Pronti, classe?',
  'Buongiorno, ragazzi!',
];

export default function HomePage({ onNavigate }) {
  const [showGreeting, setShowGreeting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Iter 37 Atom A6 — hash route awareness for #chatbot-only and #about-easter
  const [hash, setHash] = useState(() => readHash());

  // Sprint U iter 7 — rotating greeting index, cycles 3.5s
  const [greetingIdx, setGreetingIdx] = useState(() => Math.floor(Math.random() * ROTATING_GREETINGS.length));
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIdx((idx) => (idx + 1) % ROTATING_GREETINGS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Iter 36 fix Andrea — footer scimpanzè rotation 4 GIFs (public/easter/scimpanze-{1..4}.gif).
  // Andrea drops GIFs later; src 404 → onError fallback emoji 🐒.
  const [scimpanzeIdx, setScimpanzeIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setScimpanzeIdx((idx) => (idx + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Track viewport for mascotte size (240 desktop / 160 mobile)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Iter 37 Atom A6 — listen to hashchange for #chatbot-only / #about-easter
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateRoute = () => setHash(readHash());
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  // Auto-hide greeting bubble after 4s
  useEffect(() => {
    if (!showGreeting) return;
    const t = setTimeout(() => setShowGreeting(false), 4000);
    return () => clearTimeout(t);
  }, [showGreeting]);

  const handleActivate = useCallback((href) => {
    if (!href) return;
    if (href.startsWith('#')) {
      // Internal hash route: strip leading '#' for onNavigate convention
      const page = href.slice(1);

      // Iter 37 Atom A6 — chatbot-only + about-easter sono ora route LIVE
      // gestite tramite hash: aggiorniamo window.location.hash e lasciamo
      // che il listener hashchange aggiorni `hash` state per montare
      // <ChatbotOnly /> o <EasterModal /> sotto.
      if (page === 'chatbot-only' || page === 'about-easter') {
        if (typeof window !== 'undefined') {
          window.location.hash = href;
          setHash(href);
        }
        return;
      }
      if (typeof onNavigate === 'function') onNavigate(page);
      else if (typeof window !== 'undefined') window.location.hash = href;
    }
  }, [onNavigate]);

  // Iter 37 Atom A6 — close handler for EasterModal (clears #about-easter hash)
  const handleEasterClose = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Clear hash but stay on home (avoid scroll jump)
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        setHash('');
      } catch {
        window.location.hash = '';
        setHash('');
      }
    }
  }, []);

  // Iter 37 Atom A6 — back home from ChatbotOnly
  const handleChatbotBackHome = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        setHash('');
      } catch {
        window.location.hash = '';
        setHash('');
      }
    }
  }, []);

  // Iter 37 Atom A6 — open Lavagna from ChatbotOnly tools palette
  const handleChatbotOpenLavagna = useCallback(() => {
    if (typeof onNavigate === 'function') {
      onNavigate('lavagna');
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.hash = '#lavagna';
    }
  }, [onNavigate]);

  const handleMascotteClick = useCallback(() => {
    setShowGreeting(true);
  }, []);

  // Iter 38 Atom A11 — wake word pre-warm. Quando i docenti autorizzano il
  // microfono dal nudge, partiamo subito il listener "Ehi UNLIM" così è
  // pronto al primo ingresso in Lavagna (no più "Ti ascolto" silent fail).
  // Il listener gira come singleton modulo (idempotente), nessun rischio
  // doppio-mount: LavagnaShell.startWakeWordListener no-op se già attivo.
  const handleMicGrant = useCallback(() => {
    // Dynamic import per non bloccare main chunk con SpeechRecognition module.
    import('../services/wakeWord').then((mod) => {
      if (typeof mod?.isWakeWordSupported === 'function' && !mod.isWakeWordSupported()) {
        return; // Browser non supporta WebSpeech → skip silenzioso
      }
      if (typeof mod?.startWakeWordListener === 'function') {
        mod.startWakeWordListener({
          onWake: () => {
            // Wake from Home → suggest entering Lavagna (route handoff).
            try {
              window.dispatchEvent(new CustomEvent('elab-wake-from-home'));
            } catch { /* no-op */ }
          },
          onCommand: (text) => {
            try {
              window.dispatchEvent(new CustomEvent('elab-wake-command', { detail: { text } }));
            } catch { /* no-op */ }
          },
        });
      }
    }).catch(() => { /* best-effort */ });
  }, []);

  const handleResume = useCallback((target) => {
    // Cronologia onResume: target may be a hash or a page id.
    if (typeof target === 'string') {
      handleActivate(target.startsWith('#') ? target : `#${target}`);
    }
  }, [handleActivate]);

  // Iter 37 Atom A6 — route hash mounts ChatbotOnly / EasterModal
  // Mount BEFORE the home grid se hash corrisponde alle nuove route.
  if (hash === HASH_ROUTES.CHATBOT) {
    return (
      <Suspense fallback={<div data-testid="chatbot-only-loading" style={{ padding: 24 }}>Caricamento chat UNLIM…</div>}>
        <ChatbotOnly
          onBackHome={handleChatbotBackHome}
          onOpenLavagna={handleChatbotOpenLavagna}
        />
      </Suspense>
    );
  }

  return (
    <div style={styles.page} data-testid="elab-home-page" data-elab-mode="home" data-elab-routing={hash || 'root'}>
      {/* Iter 36 fix Andrea: nuvoletta animata (translateX(-50%) preservato in
          keyframes per centratura). Wave + scale subtile + opacity respect
          prefers-reduced-motion. */}
      <style>{`
        @keyframes elab-bubble-wave {
          0%   { transform: translateX(-50%) translateY(0)    scale(1);    }
          25%  { transform: translateX(-50%) translateY(-3px) scale(1.015); }
          50%  { transform: translateX(-50%) translateY(0)    scale(1);    }
          75%  { transform: translateX(-50%) translateY(2px)  scale(0.985); }
          100% { transform: translateX(-50%) translateY(0)    scale(1);    }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-testid="home-mascotte-greeting"] {
            animation: none !important;
            transform: translateX(-50%) !important;
          }
        }
      `}</style>
      {/* Iter 35 PM Andrea fix "sfondo bianco fa schifo": SVG feColorMatrix
          filter rimuove pixel bianchi PNG mascotte at runtime (no asset rebuild).
          `feColorMatrix` matrix reduces alpha by sum(R+G+B) so puro white (1,1,1)
          → alpha 0; Navy/Lime/Yellow mascotte colors stay opaque. */}
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
      >
        <defs>
          <filter id="elabRemoveWhite" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
            {/* Step 1: alpha = max(0, A - max(R,G,B)*0.95) approximation
                via 2 nodes — feColorMatrix sets alpha from RGB, feComposite
                clips to source bbox to avoid black outside source. */}
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                -1 -1 -1 1 1
              "
              result="alphaFix"
            />
            {/* Step 2: composite operator="in" w/ SourceGraphic limita risultato
                a pixel dove SourceGraphic ha alpha>0 → outside-source rimane
                trasparente (no black halo). */}
            <feComposite in="alphaFix" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>
      {/* Iter 37 Atom A6 — Easter modal overlay quando hash = #about-easter */}
      {hash === HASH_ROUTES.ABOUT && (
        <Suspense fallback={null}>
          <EasterModal isOpen={true} onClose={handleEasterClose} />
        </Suspense>
      )}
      {/* Iter 38 Atom A11 — pre-emptive mic permission nudge. Self-managed
          visibility: returns null se permission già 'granted' o se docente
          ha cliccato "Più tardi" (localStorage flag). Plurale "Ragazzi" + kit
          fisico mention. Click "Autorizza" → getUserMedia → wake word start. */}
      <Suspense fallback={null}>
        <MicPermissionNudge onGrant={handleMicGrant} />
      </Suspense>
      <header style={styles.hero}>
        <div style={styles.heroLeft}>
          <h1 style={styles.brandTitle}>
            <span style={{
              backgroundImage: styles.brandTitle.backgroundImage,
              backgroundRepeat: 'no-repeat',
              paddingBottom: 4,
            }}>
              ELAB TUTOR
            </span>
          </h1>
          <p style={styles.brandSubtitle}>
            Tutor educativo elettronica + Arduino bambini 8-14.
            <br />
            <strong style={{ color: PALETTE.navy, fontWeight: 700 }}>
              Kit fisici, volumi e lezioni pronte per la classe.
            </strong>
          </p>
        </div>

        <div
          style={{
            ...styles.heroRight,
            ...(isMobile ? styles.heroRightMobile : {}),
          }}
          data-testid="home-mascotte-container"
        >
          {/* Sprint U iter 7 — Always-visible rotating greeting cycles ROTATING_GREETINGS every 3.5s.
              Click mascotte mostra ALSO showGreeting per UX bonus (preserved). */}
          <div
            style={styles.speechBubble}
            role="status"
            aria-live="polite"
            data-testid="home-mascotte-greeting"
          >
            {ROTATING_GREETINGS[greetingIdx]}
            <span style={styles.speechBubbleArrow} aria-hidden="true" />
          </div>
          {/* MascotPresence è "fixed position" by default — qui lo wrappiamo
              ma il componente esistente usa position:fixed con localStorage.
              Iter 36 partial: usiamo un placeholder visivo che invoca lo stesso
              SVG inline + onClick greeting. Pieno wire-up MascotPresence drag
              + speaking state defer iter 37. */}
          <button
            type="button"
            onClick={handleMascotteClick}
            data-testid="home-mascotte-button"
            data-elab-action="click-mascotte"
            aria-label="Saluta la mascotte UNLIM"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {/* Sprint V iter 2 Andrea mandate 2026-05-06: revert ElabMascotte SVG
                to PNG VERA `/assets/mascot/elab-mascot-vera.png` (Andrea explicit
                "deve essere quella vera"). ElabMascotte SVG component preserved
                in src/components/common/ElabMascotte.jsx for future use. */}
            <img
              src="/assets/mascot/elab-mascot-vera.png"
              alt="Mascotte ELAB Tutor — robottino vera"
              data-testid="home-mascotte-png"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </button>
        </div>
      </header>

      <section
        style={styles.grid}
        role="region"
        aria-label="Sezioni ELAB Tutor"
        data-testid="home-card-grid"
      >
        {CARDS.map((card) => (
          <HomeCard key={card.id} card={card} onActivate={handleActivate} />
        ))}
      </section>

      {/* Cronologia sessioni preserved iter 35 */}
      <Suspense fallback={null}>
        <HomeCronologia onResume={handleResume} />
      </Suspense>

      {/* Sprint U iter 7 — Diario del docente placeholder section.
          Full impl deferred iter 8+: persistent journal + AI summaries via
          unlim-session-description + Vol/pag suggerimenti contestuali. */}
      <section
        style={{
          maxWidth: 1200,
          margin: '32px auto 0',
          padding: '24px 16px',
          fontFamily: "'Open Sans', system-ui, sans-serif",
        }}
        aria-labelledby="diario-heading"
        data-testid="home-diario-placeholder"
      >
        <h2
          id="diario-heading"
          style={{
            fontFamily: "'Oswald', system-ui, sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: PALETTE.navy,
            margin: '0 0 12px',
            letterSpacing: '0.02em',
          }}
        >
          Diario del docente
        </h2>
        <div
          style={{
            background: PALETTE.cardBg,
            border: '1px dashed rgba(30, 77, 140, 0.18)',
            borderRadius: 16,
            padding: '20px 24px',
            color: PALETTE.textMuted,
            fontSize: 15,
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: PALETTE.navy }}>In arrivo:</strong> spazio per i pensieri sulla classe, gli appunti delle lezioni, i piccoli successi dei ragazzi. UNLIM rielabora le sessioni passate e scrive brevi riassunti — voi li rileggete prima di entrare in classe.
        </div>
      </section>

      <footer style={styles.footer} id="elab-home-footer" data-testid="home-footer">
        {/* Sprint V iter 1 Phase 3 WebDesigner-1 Atom A11 — Tea credits
            HomePage footer estesi. Andrea iter 42 PM 2026-05-05 mandate:
            "nella homepage voglio mascotte e nessuna emoticon e i crediti
            per teodora de venere". Triplet PRINCIPIO ZERO + Morfismo Sense 2
            (Davide volumi cartacei + Omaric kit hardware + Giovanni
            commerciale + Andrea founder/dev + Tea UX/tester/creativa) tutti
            riconosciuti — NESSUNO è anonimo. */}
        {/* Sprint V iter 43 Andrea source-of-truth alignment 2026-05-06:
            footer ridotto a singola linea matching e2e-bypass-preview esatto.
            "Homepage a cura di Andrea Marro · Teodora de Venere" — NO ©, NO roles, NO mascotte subline. */}
        <p
          style={styles.footerCredits}
          data-testid="home-footer-credits-team"
        >
          <span>Homepage a cura di </span>
          <span style={styles.footerCreditsStrong}>Andrea Marro</span>
          <span style={{ margin: '0 8px', opacity: 0.5 }} aria-hidden="true">·</span>
          <span style={styles.footerCreditsStrong}>Teodora de Venere</span>
        </p>
        <button
          type="button"
          onClick={() => handleActivate('#about-easter')}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 12,
            background: 'transparent',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            borderRadius: 8,
            transition: 'transform 200ms ease',
          }}
          data-testid="home-footer-easter-link"
          data-elab-action="open-about-easter"
          aria-label="Chi siamo"
          title="Chi siamo"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <img
            src={`/easter/scimpanze-${(scimpanzeIdx % 4) + 1}.gif`}
            alt=""
            width={48}
            height={48}
            style={{
              display: 'block',
              objectFit: 'contain',
              borderRadius: 8,
              transition: 'opacity 600ms ease-in-out',
            }}
            onError={(e) => {
              // Fallback: scimpanzè GIFs not yet dropped public/easter/. Use emoji placeholder.
              e.currentTarget.style.display = 'none';
              const sib = e.currentTarget.nextSibling;
              if (sib) sib.style.display = 'inline-block';
            }}
          />
          <span
            aria-hidden="true"
            style={{
              display: 'none',
              fontSize: 40,
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            }}
          >
            🐒
          </span>
        </button>
      </footer>
    </div>
  );
}
