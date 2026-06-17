/**
 * HomeUnlimChatV2 — Full-integration UNLIM chat for the compile-home surface.
 *
 * Swarm 3 (2026-05-29). Andrea verbatim mandate:
 *   "con unlim integrato con chat e interfacciamento totale"
 *
 * Supersedes HomeUnlimChatInline.jsx (kept untouched for #chatbot route to
 * avoid cross-swarm regression). The V2 component is plugged into
 * HomeCompileEntry by the orchestrator AFTER swarms 1+2 close.
 *
 * Differences vs InlineV1:
 *   1. ALWAYS-PRESENT panel (not lazy/collapsed) — compile-home docente sees
 *      mascot + chat at all times.
 *   2. BIDIRECTIONAL CONTEXT — parent forwards { editorMode, sketchCode,
 *      blockCount, compileStatus, compileErrors, compileWarnings, compileSize,
 *      boardId, boardLabel, fqbn, lastUpload }. We pipe through
 *      `buildCompileHomeContext()` to shape the simulatorContext payload.
 *   3. VOICE STT/TTS — wired via existing `window.__ELAB_VOICE` global if
 *      present (Lavagna voice service auto-mounts). Falls back gracefully
 *      when voice service not loaded.
 *   4. STREAMING tokens via ARIA live region so screen readers announce
 *      progressive output without spam.
 *   5. ACTION TAG WHITELIST enforced — only IT `[AZIONE:nessuno|mostratesto|
 *      citavolpag]` and `[INTENT:{...}]` with safe action whitelisted are
 *      visible. Everything else stripped before display.
 *   6. PROMPT-INJECTION DEFENCE — compile errors / upload result strings
 *      forwarded to UNLIM are sanitized in unlimContextForCompile.js BEFORE
 *      we hand off to sendChat.
 *
 * Cross-route safety: this component is brand-new — it does NOT modify
 * HomeUnlimChatInline.jsx (used by #chatbot route) so the existing route is
 * unaffected. Use of the underlying `useGalileoChat` hook is a thin
 * read-only consumer; the hook's localStorage history is shared with
 * Lavagna (CHAT_STORAGE_KEY = 'elab-unlim-chat-history-v1'), which is the
 * intended behavior — the docente sees a single UNLIM conversation across
 * surfaces, with the surface-specific system prompt branch shaping reply.
 *
 * Locale parity: all UI text routes through useTranslation t('home_unlim_chat_v2.*').
 *
 * (c) Andrea Marro — Swarm 3 — 2026-05-29
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGalileoChat from '../lavagna/useGalileoChat.js';
import { buildCompileHomeContext, describeCompileHomeContextLine } from '../../services/unlimContextForCompile.js';
import styles from './HomeUnlimChatV2.module.css';

const MASCOT_SRC = '/assets/mascot/logo-senza-sfondo.png';

// Immutable Italian-only action-tag whitelist (CLAUDE.md rule).
// LOCK-STEP with supabase/functions/_shared/system-prompt-compile-context.ts
// `COMPILE_HOME_SAFE_ACTION_TAGS`. If you add an entry here, add it there too
// AND get Codex review (security risk if dispatch surface widens).
const COMPILE_HOME_SAFE_ACTIONS = new Set(['nessuno', 'mostratesto', 'citavolpag']);

function isCompileHomeSafeIntent(intentObj) {
  if (!intentObj || typeof intentObj.action !== 'string') return false;
  return COMPILE_HOME_SAFE_ACTIONS.has(intentObj.action.toLowerCase());
}

/**
 * Strip non-whitelisted tags from a raw UNLIM message before display.
 * - [azione:foo] / [AZIONE:foo] — ALL stripped from visible text (even
 *   whitelisted ones — they signal intent for the host UI, not user copy).
 * - [INTENT:{...}] — preserved only if the parsed JSON has `action` in whitelist.
 * Prevents an Edge Function bug OR injected prompt from rendering simulator
 * action tags inside compile-home (where they'd be dispatched against no
 * `__ELAB_API` and either crash OR mislead the docente).
 */
function sanitizeDisplayText(raw) {
  if (typeof raw !== 'string') return '';
  let out = raw;
  // INTENT JSON tags first (must run before AZIONE strip in case of nesting).
  const intentRe = /\[INTENT:(\{[\s\S]*?\})\]/g;
  out = out.replace(intentRe, (match, json) => {
    try {
      const parsed = JSON.parse(json);
      return isCompileHomeSafeIntent(parsed) ? match : '';
    } catch {
      return '';
    }
  });
  // [AZIONE:foo:bar:baz] — strip ALL azione tags from visible text. Even
  // whitelisted tags (nessuno/mostratesto/citavolpag) are removed from the
  // chat bubble — they signal intent for the host UI to consume, not
  // user-facing copy. The dispatcher (when wired) sees the raw response and
  // checks the whitelist before acting.
  const azioneRe = /\[\s*azione\s*:[^\]]*\]/gi;
  out = out.replace(azioneRe, '');
  // Collapse repeated whitespace introduced by removals.
  out = out.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

/**
 * Voice-mode controller. Returns `{ supported, listening, speaking, start,
 * stop }`. Wires the existing `window.__ELAB_VOICE` global (Lavagna voice
 * service registers it on mount). Mic access is GATED by user gesture
 * (start() is only called from onClick handlers — never on render).
 * No-op when voice service absent.
 */
function useVoiceMode({ onTranscript, onSpeak }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const transcriptCbRef = useRef(onTranscript);
  const speakCbRef = useRef(onSpeak);

  // Keep latest callbacks without retriggering effects.
  useEffect(() => { transcriptCbRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { speakCbRef.current = onSpeak; }, [onSpeak]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const voice = window.__ELAB_VOICE;
    setSupported(Boolean(voice?.startListening && voice?.speak));
  }, []);

  const start = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    const voice = window.__ELAB_VOICE;
    if (!voice?.startListening) return false;
    try {
      setListening(true);
      await voice.startListening({
        onTranscript: (text) => {
          try { transcriptCbRef.current?.(text); } catch { /* swallow */ }
        },
        onEnd: () => setListening(false),
      });
      return true;
    } catch (_err) {
      setListening(false);
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return;
    const voice = window.__ELAB_VOICE;
    try {
      voice?.stopListening?.();
    } catch { /* swallow */ }
    setListening(false);
  }, []);

  const speak = useCallback(async (text) => {
    if (typeof window === 'undefined') return;
    const voice = window.__ELAB_VOICE;
    if (!voice?.speak || !text) return;
    try {
      setSpeaking(true);
      await voice.speak(text);
      try { speakCbRef.current?.(text); } catch { /* swallow */ }
    } catch { /* swallow */ } finally {
      setSpeaking(false);
    }
  }, []);

  // Auto-stop listening on unmount.
  useEffect(() => () => stop(), [stop]);

  return { supported, listening, speaking, start, stop, speak };
}

/**
 * HomeUnlimChatV2 — main component.
 *
 * Props (all optional, parent supplies via HomeCompileEntry after merge):
 *   @param {string} sketchCode
 *   @param {'blocks'|'code'} editorMode
 *   @param {'idle'|'compiling'|'success'|'verified-legacy'|'error'} compileStatus
 *   @param {string|null} compileErrors
 *   @param {string|null} compileWarnings
 *   @param {Object|null} compileSize
 *   @param {string} boardId
 *   @param {string} boardLabel
 *   @param {string} fqbn
 *   @param {number} blockCount
 *   @param {{ok:boolean, message?:string, ts?:number}|null} lastUpload
 *   @param {(q:string) => void} [onSendOverride] - test hook
 */
export default function HomeUnlimChatV2({
  sketchCode = '',
  editorMode = 'blocks',
  compileStatus = 'idle',
  compileErrors = null,
  compileWarnings = null,
  compileSize = null,
  boardId = 'arduino-nano-r4',
  boardLabel = 'Nano R4',
  fqbn = 'arduino:renesas_uno:nanor4',
  blockCount = 0,
  lastUpload = null,
  onSendOverride = null,
}) {
  const { t, i18n } = useTranslation();
  const lang = (i18n?.language || 'it').startsWith('en') ? 'en' : 'it';

  const chat = useGalileoChat();
  const messages = chat.messages || [];
  const isLoading = !!chat.isLoading;

  const [localInput, setLocalInput] = useState('');
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const lastSpokenIdRef = useRef(null);

  // Build compile-home context every render (cheap — pure shape).
  const compileContext = useMemo(() => buildCompileHomeContext({
    sketchCode,
    editorMode,
    compileStatus,
    compileErrors,
    compileWarnings,
    compileSize,
    boardId,
    boardLabel,
    fqbn,
    blockCount,
    lastUpload,
    language: lang,
  }), [sketchCode, editorMode, compileStatus, compileErrors, compileWarnings, compileSize, boardId, boardLabel, fqbn, blockCount, lastUpload, lang]);

  // Push context into __ELAB_API.compileHome so sendChat() can pull it into
  // simulatorContext via the existing collectFullContext() path in
  // useGalileoChat (which reads __ELAB_API.getSimulatorContext()). When
  // __ELAB_API is absent (compile-home today), publish under
  // `window.__ELAB_COMPILE_CONTEXT` — Edge Function via api.js sendChat
  // forwards the field explicitly when present (see swarm-3 status hook
  // points).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__ELAB_COMPILE_CONTEXT = compileContext;
    // Cleanup on unmount — don't leak stale context to other routes.
    return () => {
      try {
        if (window.__ELAB_COMPILE_CONTEXT === compileContext) {
          delete window.__ELAB_COMPILE_CONTEXT;
        }
      } catch { /* swallow */ }
    };
  }, [compileContext]);

  // Auto-scroll to bottom on new message OR streaming token.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, isLoading]);

  // Sanitize messages once per render (memoized on messages identity).
  const visibleMessages = useMemo(() => (
    messages
      .map((m) => ({
        ...m,
        displayText: m.role === 'user' ? m.content : sanitizeDisplayText(m.content),
      }))
      .filter((m) => m.displayText && m.displayText.length > 0)
  ), [messages]);

  // Send a message — uses the underlying useGalileoChat hook send.
  // Voice path mirrors text path (onTranscript pushes into localInput then sends).
  const handleSend = useCallback((textOverride) => {
    const text = (textOverride ?? localInput ?? '').trim();
    if (!text || isLoading) return;
    setLocalInput('');
    if (typeof onSendOverride === 'function') {
      onSendOverride(text);
      return;
    }
    if (typeof chat.handleSend === 'function') {
      chat.handleSend(text);
    } else if (typeof chat.send === 'function') {
      chat.send(text);
    }
  }, [localInput, isLoading, chat, onSendOverride]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault?.();
    handleSend();
  }, [handleSend]);

  // ── Voice mode wiring ──
  const onVoiceTranscript = useCallback((text) => {
    if (typeof text !== 'string' || !text.trim()) return;
    handleSend(text);
  }, [handleSend]);

  const voice = useVoiceMode({ onTranscript: onVoiceTranscript });

  // Read the latest assistant message aloud when voice mode active.
  useEffect(() => {
    if (!voiceModeActive || !voice.supported) return;
    const last = visibleMessages[visibleMessages.length - 1];
    if (!last || last.role !== 'assistant') return;
    if (last.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = last.id;
    // Speak the cleaned display text only — never the raw content
    // (which may contain stripped tags + control noise).
    voice.speak(last.displayText);
  }, [voiceModeActive, voice, visibleMessages]);

  const toggleVoiceMode = useCallback(async () => {
    if (!voice.supported) return;
    if (voiceModeActive) {
      voice.stop();
      setVoiceModeActive(false);
      return;
    }
    const ok = await voice.start();
    if (ok) {
      setVoiceModeActive(true);
    }
  }, [voice, voiceModeActive]);

  // ESC closes voice mode (a11y per spec).
  useEffect(() => {
    if (!voiceModeActive) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        voice.stop();
        setVoiceModeActive(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [voiceModeActive, voice]);

  // ── Quick suggestions (compile-status aware) ──
  // Plurale + analogie kit fisico per Principio Zero.
  const quickSuggestions = useMemo(() => {
    if (compileStatus === 'error') {
      return [
        t('home_unlim_chat_v2.quick.fix_error'),
        t('home_unlim_chat_v2.quick.explain_code'),
      ];
    }
    if (compileStatus === 'success') {
      return [
        t('home_unlim_chat_v2.quick.upload_kit'),
        t('home_unlim_chat_v2.quick.next_experiment'),
      ];
    }
    return [
      t('home_unlim_chat_v2.quick.explain_code'),
      t('home_unlim_chat_v2.quick.what_does_it_do'),
      t('home_unlim_chat_v2.quick.help_blockly'),
    ];
  }, [compileStatus, t]);

  const handleQuickSuggestion = useCallback((q) => {
    handleSend(q);
  }, [handleSend]);

  const contextChip = describeCompileHomeContextLine(compileContext);

  return (
    <section
      className={styles.panel}
      aria-label={t('home_unlim_chat_v2.panel_aria')}
      data-testid="home-unlim-chat-v2"
      data-status={compileStatus}
      data-collapsed={collapsed ? 'true' : 'false'}
      data-voice-active={voiceModeActive ? 'true' : 'false'}
    >
      <header className={styles.header}>
        <span className={styles.mascot} aria-hidden="true">
          <img src={MASCOT_SRC} alt="" className={styles.mascotImg} draggable="false" />
        </span>
        <div className={styles.headerText}>
          <strong className={styles.title}>UNLIM</strong>
          <span className={styles.contextChip} aria-label={t('home_unlim_chat_v2.context_aria')}>
            {contextChip}
          </span>
        </div>
        {voice.supported && (
          <button
            type="button"
            className={`${styles.voiceBtn} ${voiceModeActive ? styles.voiceBtnActive : ''}`}
            onClick={toggleVoiceMode}
            aria-pressed={voiceModeActive}
            aria-label={voiceModeActive ? t('home_unlim_chat_v2.voice_stop_aria') : t('home_unlim_chat_v2.voice_start_aria')}
            title={voiceModeActive ? t('home_unlim_chat_v2.voice_stop_aria') : t('home_unlim_chat_v2.voice_start_aria')}
            data-testid="home-unlim-chat-v2-voice"
          >
            <VoiceIcon active={voiceModeActive} />
          </button>
        )}
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls="home-unlim-chat-v2-body"
          aria-label={collapsed ? t('home_unlim_chat_v2.expand_aria') : t('home_unlim_chat_v2.collapse_aria')}
          data-testid="home-unlim-chat-v2-collapse"
        >
          {collapsed ? '+' : '–'}
        </button>
      </header>

      {!collapsed && (
        <div className={styles.body} id="home-unlim-chat-v2-body">
          <div
            ref={scrollRef}
            className={styles.scroll}
            role="log"
            aria-live="polite"
            aria-busy={isLoading ? 'true' : 'false'}
            aria-relevant="additions text"
          >
            {visibleMessages.length === 0 && !isLoading && (
              <p className={styles.emptyHint} data-testid="home-unlim-chat-v2-empty">
                {t('home_unlim_chat_v2.welcome_hint')}
              </p>
            )}
            {visibleMessages.map((m, i) => (
              <div
                key={m.id || i}
                className={m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}
                data-testid={m.role === 'user' ? 'home-unlim-chat-v2-bubble-user' : 'home-unlim-chat-v2-bubble-assistant'}
                data-vision={m.hasVision ? 'true' : undefined}
              >
                {m.displayText}
              </div>
            ))}
            {isLoading && (
              <div
                className={styles.loading}
                role="status"
                aria-label={t('home_unlim_chat_v2.typing_aria')}
                data-testid="home-unlim-chat-v2-typing"
              >
                <span>·</span><span>·</span><span>·</span>
              </div>
            )}
          </div>

          {quickSuggestions.length > 0 && (
            <ul className={styles.quickRow} role="list" aria-label={t('home_unlim_chat_v2.quick_aria')}>
              {quickSuggestions.map((q, i) => (
                <li key={`q-${i}`}>
                  <button
                    type="button"
                    className={styles.quickBtn}
                    onClick={() => handleQuickSuggestion(q)}
                    disabled={isLoading}
                    data-testid={`home-unlim-chat-v2-quick-${i}`}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className={styles.inputRow} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder={t('home_unlim_chat_v2.input_placeholder')}
              className={styles.input}
              disabled={isLoading}
              data-testid="home-unlim-chat-v2-input"
              aria-label={t('home_unlim_chat_v2.input_aria')}
              autoComplete="off"
              spellCheck="true"
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={isLoading || !localInput.trim()}
              data-testid="home-unlim-chat-v2-send"
              aria-label={t('home_unlim_chat_v2.send_aria')}
            >
              {t('home_unlim_chat_v2.send')}
            </button>
          </form>
          {voiceModeActive && (
            <p className={styles.voiceHint} role="status" aria-live="polite">
              {voice.listening
                ? t('home_unlim_chat_v2.voice_listening')
                : t('home_unlim_chat_v2.voice_ready')}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function VoiceIcon({ active }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" fill={active ? 'currentColor' : 'none'} />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

// Test helpers (DO NOT import from production code).
export const __test__ = {
  sanitizeDisplayText,
  isCompileHomeSafeIntent,
  COMPILE_HOME_SAFE_ACTIONS,
};
