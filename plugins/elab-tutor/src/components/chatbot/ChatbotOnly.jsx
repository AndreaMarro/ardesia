/**
 * ChatbotOnly — Sprint T iter 37 Atom A6 (WebDesigner-1)
 *
 * Route #chatbot-only — interfaccia chat-only (NO Lavagna actions) con:
 *   - Sidebar Cronologia ChatGPT-style (sezioni Oggi/Ieri/Settimana/Più
 *     vecchie + per sessione UNLIM-generated description + badge stato)
 *   - Main chat panel: useGalileoChat hook + Onniscenza (collectFullContext
 *     wired) + chatbot UI minimal (filtra INTENT tags chatbot-safe subset)
 *   - Tools palette right: 5 button SVG (Vision / Compile / Fumetto /
 *     Lavagna mini / Reset)
 *
 * Iter 64 T2 Lighthouse perf optim (Sprint U):
 *   Shell (sidebar + tools palette + header skeleton) renders synchronously.
 *   The chat panel — which owns `useGalileoChat` and transitively pulls
 *   ~700KB of supabase + RAG + lesson-paths data — is split into a lazy
 *   chunk via React.lazy + Suspense. This eliminates the heavy chain from
 *   first paint of the #chatbot-only route, lifting Lighthouse perf
 *   from 26/100 (iter 38 baseline) toward ≥90.
 *
 * Compliance gate iter 37 §0:
 *   ✅ Linguaggio plurale "Ragazzi" (welcome + new chat + tooltips)
 *   ✅ Kit fisico mention (placeholder input + tooltips tools)
 *   ✅ Palette tokens var(--elab-*) — NO hard-coded
 *   ✅ Iconografia ElabIcons SVG (NO emoji come icone)
 *   ✅ Touch ≥44px tools/send/sidebar items
 *   ✅ Font ≥13px body / 10px label / 16px LIM
 *   ✅ WCAG AA contrast Navy bg + white text
 *   ✅ Cross-pollination Onniscenza wired via useGalileoChat hook (L1+L4+L7)
 *
 * Andrea Marro — iter 37 — 2026-04-30 — iter 64 perf split 2026-05-15
 */
import React, { useEffect, useMemo, useRef, useState, useCallback, Suspense, lazy } from 'react';
import styles from './ChatbotOnly.module.css';
import {
  CameraIcon,
  WrenchIcon,
  ReportIcon,
  CircuitIcon,
  RefreshIcon,
} from '../common/ElabIcons.jsx';

// Lazy-loaded chat panel — pulls useGalileoChat + supabase + RAG context
// collector + lesson-paths data into its own chunk. Loaded after the shell
// paints to keep #chatbot-only Lighthouse perf high.
const ChatbotChatPanel = lazy(() => import('./ChatbotChatPanel.jsx'));

const SESSIONS_KEY = 'elab_unlim_sessions';
const MAX_SIDEBAR_ITEMS = 50;
const CAP_THRESHOLD_MIN = 60 * 24 * 30; // 30 giorni → "vecchia"

/**
 * Format timestamp into a human-readable bucket label.
 */
function bucketSession(session, nowMs = Date.now()) {
  const ts = new Date(session?.endTime || session?.startTime || session?.startedAt || 0).getTime();
  if (!Number.isFinite(ts) || ts === 0) return 'piuVecchie';
  const diffMin = Math.max(0, Math.floor((nowMs - ts) / 60000));
  if (diffMin < 60 * 24) return 'oggi';
  if (diffMin < 60 * 48) return 'ieri';
  if (diffMin < 60 * 24 * 7) return 'settimana';
  return 'piuVecchie';
}

function getBadge(session, nowMs = Date.now()) {
  const status = session?.status;
  if (status === 'sospesa') return 'Sospesa';
  if (status === 'cap') return 'Cap';
  const ts = new Date(session?.endTime || session?.startTime || 0).getTime();
  if (Number.isFinite(ts) && ts > 0) {
    const diffMin = Math.floor((nowMs - ts) / 60000);
    if (diffMin > CAP_THRESHOLD_MIN) return 'Vecchia';
  }
  return null;
}

function loadSessions() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s) => s && (s.experimentId || s.id))
      .sort((a, b) => {
        const ta = new Date(a.endTime || a.startTime || 0).getTime();
        const tb = new Date(b.endTime || b.startTime || 0).getTime();
        return tb - ta;
      })
      .slice(0, MAX_SIDEBAR_ITEMS);
  } catch {
    return [];
  }
}

function HistoryItem({ session, isActive, onSelect }) {
  const title = session?.title || session?.experimentId || 'Sessione';
  const description = session?.description_unlim
    || `${session?.messages?.length || 0} interazioni con UNLIM`;
  const badge = getBadge(session);

  const handleClick = useCallback(() => {
    if (typeof onSelect === 'function') onSelect(session);
  }, [onSelect, session]);

  return (
    <button
      type="button"
      className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
      onClick={handleClick}
      data-testid="chatbot-history-item"
      aria-label={`Sessione: ${title}`}
      title={`Ragazzi, riprendete la sessione: ${title}`}
    >
      <span className={styles.sidebarItemTitle}>{title}</span>
      <span className={styles.sidebarItemDescription}>{description}</span>
      {badge && (
        <span className={styles.sidebarItemBadge} data-testid="chatbot-history-badge">
          {badge}
        </span>
      )}
    </button>
  );
}

function SidebarCronologia({ sessions, activeId, onSelect, onNewChat, onBackHome }) {
  const grouped = useMemo(() => {
    const buckets = { oggi: [], ieri: [], settimana: [], piuVecchie: [] };
    for (const s of sessions) {
      const b = bucketSession(s);
      buckets[b].push(s);
    }
    return buckets;
  }, [sessions]);

  return (
    <aside className={styles.sidebar} data-testid="chatbot-sidebar">
      <div className={styles.sidebarHeader}>
        <h2 className={styles.brandTitle}>Chat UNLIM</h2>
        <button
          type="button"
          className={styles.backHomeBtn}
          onClick={onBackHome}
          aria-label="Torna alla home ELAB"
          data-testid="chatbot-back-home"
        >
          ← Home
        </button>
      </div>

      <button
        type="button"
        className={styles.newChatBtn}
        onClick={onNewChat}
        aria-label="Iniziate una nuova chat con UNLIM"
        data-testid="chatbot-new-chat-btn"
        title="Ragazzi, iniziate una nuova chat con UNLIM"
      >
        Nuova chat
      </button>

      <nav className={styles.sidebarScroll} aria-label="Cronologia chat">
        {sessions.length === 0 ? (
          <div className={styles.sidebarEmpty} data-testid="chatbot-sidebar-empty">
            Ragazzi, qui apparirà la cronologia delle vostre sessioni con UNLIM.
            Aprite il kit ELAB e iniziate una nuova chat sopra.
          </div>
        ) : (
          [
            { key: 'oggi', label: 'Oggi' },
            { key: 'ieri', label: 'Ieri' },
            { key: 'settimana', label: 'Questa settimana' },
            { key: 'piuVecchie', label: 'Più vecchie' },
          ].map(({ key, label }) =>
            grouped[key].length > 0 ? (
              <section key={key} className={styles.sidebarSection}>
                <h3 className={styles.sidebarSectionLabel}>{label}</h3>
                {grouped[key].map((s) => (
                  <HistoryItem
                    key={s.id || `${s.experimentId}-${s.startTime || ''}`}
                    session={s}
                    isActive={s.id === activeId}
                    onSelect={onSelect}
                  />
                ))}
              </section>
            ) : null
          )
        )}
      </nav>
    </aside>
  );
}

function ToolsPalette({ onVision, onCompile, onFumetto, onLavagna, onReset, busy }) {
  const tools = [
    {
      id: 'vision',
      Icon: CameraIcon,
      label: 'Vision',
      onClick: onVision,
      tip: 'Ragazzi, qui troverete la diagnosi del vostro circuito',
    },
    {
      id: 'compile',
      Icon: WrenchIcon,
      label: 'Compila',
      onClick: onCompile,
      tip: 'Ragazzi, qui compileremo lo sketch Arduino',
    },
    {
      id: 'fumetto',
      Icon: ReportIcon,
      label: 'Fumetto',
      onClick: onFumetto,
      tip: 'Ragazzi, qui creeremo il report fumetto della classe',
    },
    {
      id: 'lavagna',
      Icon: CircuitIcon,
      label: 'Lavagna',
      onClick: onLavagna,
      tip: 'Ragazzi, qui aprirete la Lavagna ELAB Tutor',
    },
    {
      id: 'reset',
      Icon: RefreshIcon,
      label: 'Reset',
      onClick: onReset,
      tip: 'Ragazzi, qui ripuliremo la chat',
    },
  ];

  return (
    <aside className={styles.tools} data-testid="chatbot-tools-palette" aria-label="Strumenti UNLIM">
      {tools.map(({ id, Icon, label, onClick, tip }) => (
        <React.Fragment key={id}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={onClick}
            disabled={!!busy}
            title={tip}
            aria-label={tip}
            data-testid={`chatbot-tool-${id}`}
          >
            <Icon size={22} />
          </button>
          <span className={styles.toolLabel} aria-hidden="true">{label}</span>
        </React.Fragment>
      ))}
    </aside>
  );
}

/**
 * Lightweight fallback shown while the lazy chat panel chunk loads.
 * Keeps the chat area visually populated (header skeleton) so the LCP
 * candidate is the chat header rather than reflowing on hydration.
 */
function ChatPanelFallback() {
  return (
    <>
      <header className={styles.chatHeader}>
        <span className={styles.mascotteSmall} aria-hidden="true">
          <img
            src="/assets/mascot/elab-mascot-vera.png"
            alt="UNLIM"
            className="elab-mascotte-vera"
            loading="eager"
            decoding="async"
            draggable={false}
            style={{ width: 28, height: 28, objectFit: 'contain' }}
          />
        </span>
        <div>
          <h1 className={styles.chatHeaderTitle}>UNLIM</h1>
          <p className={styles.chatHeaderSub}>
            Ragazzi, qui parlate con il tutor — kit fisici sempre pronti.
          </p>
        </div>
      </header>
      <div className={styles.chatScroll} aria-busy="true" data-testid="chatbot-chat-loading">
        <div
          className={`${styles.bubble} ${styles.bubbleAssistant} ${styles.bubbleAssistantLoading}`}
          role="status"
          aria-live="polite"
        >
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
        </div>
      </div>
    </>
  );
}

export default function ChatbotOnly({ onBackHome, onOpenLavagna }) {
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(null);
  const panelRef = useRef(null);
  const [panelBusy, setPanelBusy] = useState(false);

  // Listen for cross-tab session updates
  useEffect(() => {
    const handler = (ev) => {
      if (ev?.key && ev.key !== SESSIONS_KEY) return;
      setSessions(loadSessions());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    if (panelRef.current && typeof panelRef.current.reset === 'function') {
      try { panelRef.current.reset(); } catch { /* defensive */ }
    }
  }, []);

  const handleSelectSession = useCallback((session) => {
    if (!session) return;
    setActiveSessionId(session.id || null);
    // Stash deep-link target for Lavagna handoff if user wants to resume there.
    try {
      if (session.experimentId) {
        localStorage.setItem('elab_resume_experiment', session.experimentId);
      }
    } catch { /* best effort */ }
  }, []);

  const handleBackHome = useCallback(() => {
    if (typeof onBackHome === 'function') {
      onBackHome();
      return;
    }
    if (typeof window !== 'undefined') {
      // Iter 44 fix Andrea 2026-05-06 PM "non si puo tornare indietro":
      // hash = '#' empty → App.jsx getPageFromHash null → setCurrentPage skip
      // → no re-render. Fix: explicit '#home' route VALID_HASHES.
      window.location.hash = '#home';
    }
  }, [onBackHome]);

  const handleVision = useCallback(() => {
    if (panelRef.current && typeof panelRef.current.sendVision === 'function') {
      panelRef.current.sendVision();
    }
  }, []);

  const handleCompile = useCallback(() => {
    if (panelRef.current && typeof panelRef.current.sendCompile === 'function') {
      panelRef.current.sendCompile();
    }
  }, []);

  const handleFumetto = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('elab-navigate', {
        detail: { tab: 'fumetto' },
      }));
    }
  }, []);

  const handleLavagnaMini = useCallback(() => {
    if (typeof onOpenLavagna === 'function') {
      onOpenLavagna();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.hash = '#lavagna';
    }
  }, [onOpenLavagna]);

  const handleResetClick = useCallback(() => {
    if (panelRef.current && typeof panelRef.current.reset === 'function') {
      panelRef.current.reset();
    }
  }, []);

  return (
    <div className={styles.shell} data-testid="chatbot-only-shell">
      <SidebarCronologia
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={handleSelectSession}
        onNewChat={handleNewChat}
        onBackHome={handleBackHome}
      />

      <main className={styles.main} aria-label="Conversazione UNLIM">
        <Suspense fallback={<ChatPanelFallback />}>
          <ChatbotChatPanel ref={panelRef} />
        </Suspense>
      </main>

      <ToolsPalette
        onVision={handleVision}
        onCompile={handleCompile}
        onFumetto={handleFumetto}
        onLavagna={handleLavagnaMini}
        onReset={handleResetClick}
        busy={panelBusy}
      />
    </div>
  );
}
