/**
 * ChatbotChatPanel — Sprint U iter 64 T2 Lighthouse perf optim
 *
 * Extracted chat-panel portion of ChatbotOnly so that the heavy
 * `useGalileoChat` hook (1379 LOC + supabase + RAG context collector +
 * lesson-paths data ~533KB chunk) is split into a separate lazy chunk
 * loaded only after the chatbot shell paints.
 *
 * Pattern: React.lazy + Suspense (mirror HomePage.jsx ChatbotOnly /
 * EasterModal lazy-load). The shell (sidebar + tools palette) renders
 * synchronously from ChatbotOnly.jsx; this panel hydrates after the
 * initial paint, eliminating ~700KB+ from the first paint of the
 * #chatbot-only route.
 *
 * Iter 38 baseline Lighthouse perf chatbot-only = 26/100, TBT 4270ms,
 * LCP 16.9s, unused JS 648KB. Goal iter 64 ≥90 perf.
 *
 * Andrea Marro — iter 64 — 2026-05-15
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import styles from './ChatbotOnly.module.css';
import { SendIcon } from '../common/ElabIcons.jsx';
import useGalileoChat from '../lavagna/useGalileoChat.js';

const CHATBOT_SAFE_INTENT_ACTIONS = new Set(['nessuno', 'mostratesto', 'citavolpag']);

function isChatbotSafeIntent(intentObj) {
  if (!intentObj || typeof intentObj.action !== 'string') return false;
  return CHATBOT_SAFE_INTENT_ACTIONS.has(intentObj.action.toLowerCase());
}

function sanitizeChatbotText(raw) {
  if (typeof raw !== 'string') return '';
  let out = raw;
  const intentRe = /\[INTENT:(\{[\s\S]*?\})\]/g;
  out = out.replace(intentRe, (match, json) => {
    try {
      const parsed = JSON.parse(json);
      return isChatbotSafeIntent(parsed) ? match : '';
    } catch { return ''; }
  });
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

/**
 * Chat panel — owns the useGalileoChat hook + render of bubbles + input.
 *
 * Exposes imperative handlers (vision / compile / fumetto / reset) to the
 * parent ChatbotOnly via the `panelRef` ref so the tools palette
 * (synchronously rendered in the shell) can still drive panel actions
 * without forcing the shell to hold the hook.
 */
const ChatbotChatPanel = React.forwardRef(function ChatbotChatPanel(_props, panelRef) {
  const scrollRef = useRef(null);

  // Hook UNLIM chat (Onniscenza wired via useGalileoChat -> collectFullContext)
  const chat = useGalileoChat();
  const { messages, input, isLoading } = chat;
  const handleSend = chat.handleSend || chat.send || (() => {});
  const handleInputChange = chat.setInput || chat.handleInputChange || (() => {});
  const handleReset = chat.handleReset || chat.resetChat || (() => {});

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  // Expose handlers to parent via ref for tools-palette wiring.
  React.useImperativeHandle(panelRef, () => ({
    sendVision: () => {
      if (typeof handleSend === 'function') {
        handleSend('Guarda il mio circuito e diagnosticalo, ragazzi.');
      }
    },
    sendCompile: () => {
      if (typeof handleSend === 'function') {
        handleSend('Compila lo sketch Arduino corrente e mostrami eventuali errori.');
      }
    },
    reset: () => {
      if (typeof handleReset === 'function') handleReset();
    },
    isLoading,
  }), [handleSend, handleReset, isLoading]);

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
    <>
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
    </>
  );
});

export default ChatbotChatPanel;
