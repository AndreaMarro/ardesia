/**
 * HomeUnlimChatInline — Compact UNLIM chat panel embedded inside a HomePage card.
 *
 * Mirrors ChatbotChatPanel's use of `useGalileoChat` but renders a smaller
 * 3-row layout suited to a homepage card: 1) message scroll, 2) text input,
 * 3) send button. No tools palette, no vision/compile/fumetto handlers — those
 * remain in the dedicated `#chatbot-only` and `#lavagna` routes.
 *
 * Lazy-loaded by HomePage so the 533KB useGalileoChat chunk only loads if
 * a docente opens the card.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGalileoChat from '../lavagna/useGalileoChat.js';

const CHATBOT_SAFE_INTENT_ACTIONS = new Set(['nessuno', 'mostratesto', 'citavolpag']);

function isChatbotSafeIntent(intentObj) {
  if (!intentObj || typeof intentObj.action !== 'string') return false;
  return CHATBOT_SAFE_INTENT_ACTIONS.has(intentObj.action.toLowerCase());
}

function sanitizeText(raw) {
  if (typeof raw !== 'string') return '';
  let out = raw;
  const intentRe = /\[INTENT:(\{[\s\S]*?\})\]/g;
  out = out.replace(intentRe, (match, json) => {
    try {
      const parsed = JSON.parse(json);
      return isChatbotSafeIntent(parsed) ? match : '';
    } catch {
      return '';
    }
  });
  out = out.replace(/\[azione:[^\]]+\]/gi, '').replace(/\[AZIONE:[^\]]+\]/g, '');
  return out.trim();
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: 16,
    border: '1px solid rgba(30, 77, 140, 0.16)',
    borderRadius: 12,
    background: '#FFFFFF',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
    minHeight: 180,
    maxHeight: 240,
    overflowY: 'auto',
    padding: '12px 14px',
    background: 'linear-gradient(180deg, rgba(30, 77, 140, 0.02) 0%, rgba(255, 255, 255, 1) 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 14,
    lineHeight: 1.45,
    color: '#1A1A1A',
  },
  emptyHint: {
    color: '#5A6B7E',
    fontStyle: 'italic',
    fontSize: 13,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    background: '#F0F4F8',
    borderRadius: '12px 12px 12px 4px',
    padding: '8px 12px',
    maxWidth: '85%',
    whiteSpace: 'pre-wrap',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    background: 'var(--elab-navy, #1E4D8C)',
    color: '#FFFFFF',
    borderRadius: '12px 12px 4px 12px',
    padding: '8px 12px',
    maxWidth: '85%',
    whiteSpace: 'pre-wrap',
  },
  loadingDots: {
    display: 'inline-flex',
    gap: 4,
    padding: '8px 12px',
    background: '#F0F4F8',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: 10,
    borderTop: '1px solid rgba(30, 77, 140, 0.12)',
    background: '#FAFBFC',
  },
  input: {
    flex: 1,
    border: '1px solid rgba(30, 77, 140, 0.2)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    color: '#1A1A1A',
    background: '#FFFFFF',
  },
  sendBtn: {
    background: 'var(--elab-navy, #1E4D8C)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    minWidth: 72,
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default function HomeUnlimChatInline() {
  const { t } = useTranslation();
  const chat = useGalileoChat();
  const messages = chat.messages || [];
  const isLoading = !!chat.isLoading;
  const input = chat.input ?? '';
  const setInput = chat.setInput || chat.handleInputChange || (() => {});
  const send = chat.handleSend || chat.send || (() => {});

  const scrollRef = useRef(null);
  const [localInput, setLocalInput] = useState('');

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, isLoading]);

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalInput(value);
    if (typeof setInput === 'function') setInput(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = (localInput || input || '').trim();
    if (!text || isLoading) return;
    setLocalInput('');
    if (typeof send === 'function') send(text);
  };

  const visibleMessages = useMemo(
    () =>
      messages
        .map((m) => ({
          ...m,
          content: m.role === 'user' ? m.content : sanitizeText(m.content),
        }))
        .filter((m) => m.content && m.content.length > 0),
    [messages]
  );

  return (
    <div style={styles.wrap} data-testid="home-unlim-chat-inline" onClick={(e) => e.stopPropagation()}>
      <div ref={scrollRef} style={styles.scroll} role="log" aria-live="polite">
        {visibleMessages.length === 0 && !isLoading && (
          <p style={styles.emptyHint} data-testid="home-unlim-chat-empty">
            Chiedi a UNLIM una lezione, un esperimento, una citazione dai Volumi.
          </p>
        )}
        {visibleMessages.map((m, i) => (
          <div
            key={m.id || i}
            style={m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}
            data-testid={m.role === 'user' ? 'home-unlim-bubble-user' : 'home-unlim-bubble-assistant'}
          >
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div style={styles.loadingDots} role="status" aria-label={t('home_chat_inline.typing_aria')}>
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
        )}
      </div>
      <form style={styles.inputRow} onSubmit={handleSubmit}>
        <input
          type="text"
          value={localInput}
          onChange={handleChange}
          placeholder={t('home_chat_inline.placeholder')}
          style={styles.input}
          disabled={isLoading}
          data-testid="home-unlim-chat-input"
          aria-label={t('home_chat_inline.input_aria')}
        />
        <button
          type="submit"
          style={{
            ...styles.sendBtn,
            ...(isLoading || !(localInput || input || '').trim() ? styles.sendBtnDisabled : {}),
          }}
          disabled={isLoading || !(localInput || input || '').trim()}
          data-testid="home-unlim-chat-send"
        >
          Invia
        </button>
      </form>
    </div>
  );
}
