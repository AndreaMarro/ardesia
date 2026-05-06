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
 * Andrea Marro — iter 37 — 2026-04-30
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import styles from './ChatbotOnly.module.css';
import {
  CameraIcon,
  WrenchIcon,
  ReportIcon,
  CircuitIcon,
  RefreshIcon,
  SendIcon,
  RobotIcon,
} from '../common/ElabIcons.jsx';
import useGalileoChat from '../lavagna/useGalileoChat.js';

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

/**
 * INTENT validate subset chatbot-safe (per PDR spec §3 A6).
 * Whitelist permitted tags: nessuno, mostraTesto, citaVolPag.
 * Tutti gli altri tag (es. azione lavagna) sono filtrati out display-only.
 */
const CHATBOT_SAFE_INTENT_ACTIONS = new Set(['nessuno', 'mostratesto', 'citavolpag']);
function isChatbotSafeIntent(intentObj) {
  if (!intentObj || typeof intentObj.action !== 'string') return false;
  return CHATBOT_SAFE_INTENT_ACTIONS.has(intentObj.action.toLowerCase());
}

/**
 * Strip Lavagna-only INTENT tags from displayed chatbot text.
 * The full chat hook executes them in lavagna mode; in chatbot we suppress
 * non-safe actions visually too (defensive — useGalileoChat already strips
 * before display).
 */
function sanitizeChatbotText(raw) {
  if (typeof raw !== 'string') return '';
  // Remove [INTENT:{...}] blocks that are not chatbot-safe
  let out = raw;
  const intentRe = /\[INTENT:(\{[\s\S]*?\})\]/g;
  out = out.replace(intentRe, (match, json) => {
    try {
      const parsed = JSON.parse(json);
      return isChatbotSafeIntent(parsed) ? match : '';
    } catch { return ''; }
  });
  // AZIONE tags always stripped (Lavagna only)
  out = out.replace(/\[azione:[^\]]+\]/gi, '').replace(/\[AZIONE:[^\]]+\]/g, '');
  return out.trim();
}

function MascotteAvatar() {
  // Iter 44 fix Andrea 2026-05-06: chat avatar UNLIM era RobotIcon SVG
  // generico (foto 1 segnalata "dovrebbe esserci vero logo"). Sostituito
  // con PNG mascotte ELAB ufficiale `elab-mascot-vera.png` (stesso asset
  // homepage). Animazioni elab-mascotte-vera class apply (idle bob +
  // glow pulse + filter url(#elabRemoveWhite) per sfondo bianco baked-in).
  return (
    <span className={styles.mascotteSmall} aria-hidden="true">
      <img
        src="/assets/mascot/elab-mascot-vera.png"
        alt="UNLIM"
        className="elab-mascotte-vera"
        loading="eager"
        decoding="async"
        draggable={false}
        style={{
          width: 28,
          height: 28,
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </span>
  );
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

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const content = isUser ? message.content : sanitizeChatbotText(message.content);
  return (
    <div
      className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}
      data-testid={isUser ? 'chatbot-bubble-user' : 'chatbot-bubble-assistant'}
      role={isUser ? undefined : 'status'}
    >
      {content}
    </div>
  );
}

function LoadingBubble() {
  return (
    <div
      className={`${styles.bubble} ${styles.bubbleAssistant} ${styles.bubbleAssistantLoading}`}
      role="status"
      aria-live="polite"
      data-testid="chatbot-bubble-loading"
    >
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
    </div>
  );
}

export default function ChatbotOnly({ onBackHome, onOpenLavagna }) {
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(null);
  const scrollRef = useRef(null);

  // Hook UNLIM chat (Onniscenza wired via useGalileoChat -> collectFullContext)
  // NOTE: useGalileoChat è il same hook usato dalla Lavagna; il filtering
  // INTENT-tags chatbot-safe è applicato visivamente in sanitizeChatbotText.
  const chat = useGalileoChat();
  const { messages, input, isLoading } = chat;
  const handleSend = chat.handleSend || chat.send || (() => {});
  const handleInputChange = chat.setInput || chat.handleInputChange || (() => {});
  const handleReset = chat.handleReset || chat.resetChat || (() => {});

  // Listen for cross-tab session updates
  useEffect(() => {
    const handler = (ev) => {
      if (ev?.key && ev.key !== SESSIONS_KEY) return;
      setSessions(loadSessions());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    if (typeof handleReset === 'function') {
      try { handleReset(); } catch { /* defensive */ }
    }
  }, [handleReset]);

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
      window.location.hash = '#';
    }
  }, [onBackHome]);

  const handleVision = useCallback(() => {
    if (typeof handleSend === 'function') {
      handleSend('Guarda il mio circuito e diagnosticalo, ragazzi.');
    }
  }, [handleSend]);

  const handleCompile = useCallback(() => {
    if (typeof handleSend === 'function') {
      handleSend('Compila lo sketch Arduino corrente e mostrami eventuali errori.');
    }
  }, [handleSend]);

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
    if (typeof handleReset === 'function') handleReset();
  }, [handleReset]);

  const onInputChange = useCallback((e) => {
    if (typeof handleInputChange === 'function') {
      handleInputChange(e.target.value);
    }
  }, [handleInputChange]);

  const onInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input?.trim() && typeof handleSend === 'function') {
        handleSend();
      }
    }
  }, [handleSend, isLoading, input]);

  const onSendClick = useCallback(() => {
    if (!isLoading && input?.trim() && typeof handleSend === 'function') {
      handleSend();
    }
  }, [handleSend, isLoading, input]);

  const visibleMessages = useMemo(() => Array.isArray(messages) ? messages : [], [messages]);

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
        <header className={styles.chatHeader}>
          <MascotteAvatar />
          <div>
            <h1 className={styles.chatHeaderTitle}>UNLIM</h1>
            <p className={styles.chatHeaderSub}>
              Ragazzi, qui parlate con il tutor — kit fisici sempre pronti.
            </p>
          </div>
        </header>

        <div ref={scrollRef} className={styles.chatScroll} data-testid="chatbot-chat-scroll">
          {visibleMessages.map((m) => (
            <ChatBubble key={m.id || `${m.role}-${m.content?.slice(0, 8) || Math.random()}`} message={m} />
          ))}
          {isLoading && <LoadingBubble />}
        </div>

        <div className={styles.composer}>
          <textarea
            className={styles.input}
            value={input || ''}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            placeholder="Ragazzi, scrivete cosa volete costruire dal kit ELAB…"
            rows={2}
            aria-label="Scrivete il vostro messaggio per UNLIM"
            data-testid="chatbot-input"
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.sendBtn}
            onClick={onSendClick}
            disabled={isLoading || !(input?.trim())}
            aria-label="Invia messaggio a UNLIM"
            data-testid="chatbot-send-btn"
          >
            <SendIcon size={18} color="var(--elab-hex-ffffff)" />
            Invia
          </button>
        </div>
      </main>

      <ToolsPalette
        onVision={handleVision}
        onCompile={handleCompile}
        onFumetto={handleFumetto}
        onLavagna={handleLavagnaMini}
        onReset={handleResetClick}
        busy={isLoading}
      />
    </div>
  );
}
