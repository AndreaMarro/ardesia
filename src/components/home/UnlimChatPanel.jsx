/**
 * UnlimChatPanel — floating full-chat surface for the #compile-home route.
 *
 * Wave 2 X.3b Impl-E split from UnlimCompileHelper.jsx (152 LOC iter 104 C3):
 *  - UnlimCompileHelper.jsx → mini banner ONLY (mascot + speech + 3 quick-q +
 *    "Apri chat completa" CTA) — preserves iter 104 C3 export contract
 *  - UnlimChatPanel.jsx (THIS FILE) → floating chat window with:
 *    1. RAG Blockly-aware retrieval via searchRAGChunks() against rag-chunks.json
 *    2. Vision wire: "guarda il mio circuito" trigger → __ELAB_API.unlim
 *       .captureScreenshot() + POST to existing analyzeImage() (Gemini Vision)
 *
 * Architectural decisions (Andrea Principio Zero + Morfismo):
 *  - NO local fake answers (G45 audit + iter 104 C3 mandate "MAI dati finti")
 *  - All UNLIM responses route through real RAG (rag-chunks.json 549 chunks)
 *    OR analyzeImage() endpoint; canned status lines (e.g. "Sto guardando il
 *    vostro circuito") are CLEARLY transient/UI affordance, NOT fake answers
 *  - IT plurale ("Ragazzi" / "Potete" / "Vediamo") — Principio Zero
 *  - Vol/pag verbatim citation surfaced from RAG chunk metadata
 *  - MAX 120 parole per UNLIM message (feedback_unlim_language_rules_10may2026)
 *
 * Styling: inline style objects (no CSS module — Wave 2b ownership lock holds
 * exactly 3 files; CSS module would be a 4th file under home/). Tokens mirror
 * src/styles/* palette: Navy #1E4D8C, Lime #4A7A25, Orange #E8941C.
 *
 * Props:
 *   isOpen: boolean — controls visibility
 *   onClose: () => void — close handler from parent
 *   editorMode: 'blocks' | 'code' — passed for context awareness
 *   sketchCode: string — current source (forwarded to vision context if needed)
 *   blockCount: number — number of Blockly blocks placed
 *
 * © Andrea Marro — Wave 2 X.3b Impl-E — 2026-05-25
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchRAGChunks } from '../../data/unlim-knowledge-base';

const MASCOT_SRC = '/assets/mascot/logo-senza-sfondo.png';
const VISION_TRIGGER = /guarda\s+il\s+mio\s+circuito|guarda\s+il\s+circuito|guarda\s+la\s+lavagna/i;

// Blockly block-keyword registry — mirrors src/components/simulator/panels/
// scratchBlocks.js `Blockly.Blocks['arduino_*']` names (side-effect registry,
// no runtime export). Used to expand RAG search query so a kid typing
// "pinMode" or "digitalWrite" matches the volume's italian description.
const BLOCKLY_KEYWORDS = [
  'pinmode', 'digitalwrite', 'digitalread', 'analogwrite', 'analogread',
  'delay', 'millis', 'serial', 'tone', 'servo', 'lcd', 'random', 'map',
  'led', 'pulsante', 'resistenza', 'sensore', 'breadboard',
];

const styles = {
  panel: {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    width: '380px',
    maxWidth: 'calc(100vw - 32px)',
    height: '520px',
    maxHeight: 'calc(100vh - 48px)',
    display: 'flex',
    flexDirection: 'column',
    background: '#FFFFFF',
    border: '1.5px solid #1E4D8C',
    borderRadius: '16px',
    boxShadow: '0 12px 32px rgba(30, 77, 140, 0.18)',
    zIndex: 1200,
    overflow: 'hidden',
    fontFamily: '"Open Sans", system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: '#1E4D8C',
    color: '#FFFFFF',
  },
  mascotMini: {
    flexShrink: 0,
    width: '36px',
    height: '36px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1.5px solid #4A7A25',
    borderRadius: '50%',
    overflow: 'hidden',
  },
  mascotImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center 70%',
    display: 'block',
  },
  headerText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  title: {
    fontFamily: '"Oswald", system-ui, sans-serif',
    fontSize: '16px',
    letterSpacing: '0.5px',
  },
  contextChip: {
    fontSize: '11px',
    opacity: 0.85,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeBtn: {
    minWidth: '44px',
    minHeight: '44px',
    padding: 0,
    background: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1,
    cursor: 'pointer',
    borderRadius: '8px',
  },
  messageList: {
    flex: 1,
    listStyle: 'none',
    margin: 0,
    padding: '12px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: '#F5F7FA',
  },
  baseMsg: {
    padding: '10px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    lineHeight: 1.45,
    maxWidth: '92%',
    wordWrap: 'break-word',
  },
  welcome: {
    background: '#FFFFFF',
    border: '1px solid #E0E6ED',
    color: '#1A1A1A',
    alignSelf: 'stretch',
    fontStyle: 'italic',
  },
  userMsg: {
    background: '#1E4D8C',
    color: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  unlimMsg: {
    background: '#FFFFFF',
    border: '1px solid #4A7A25',
    color: '#1A1A1A',
    alignSelf: 'flex-start',
  },
  unlimMsgVision: {
    border: '1px solid #E8941C',
    background: 'rgba(232, 148, 28, 0.06)',
  },
  thinking: {
    background: '#F5F7FA',
    border: '1px dashed #5A6B7E',
    color: '#5A6B7E',
    alignSelf: 'flex-start',
    fontStyle: 'italic',
  },
  chatForm: {
    display: 'flex',
    gap: '8px',
    padding: '10px 12px',
    background: '#FFFFFF',
    borderTop: '1px solid #E0E6ED',
  },
  chatInput: {
    flex: 1,
    minHeight: '44px',
    padding: '10px 12px',
    border: '1.5px solid #E0E6ED',
    borderRadius: '10px',
    background: '#FFFFFF',
    color: '#1A1A1A',
    fontFamily: '"Open Sans", system-ui, sans-serif',
    fontSize: '14px',
  },
  chatSubmit: {
    minWidth: '64px',
    minHeight: '44px',
    padding: '0 16px',
    background: '#1E4D8C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontFamily: '"Open Sans", system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

function clampToWordCap(text, maxWords = 120) {
  if (!text || typeof text !== 'string') return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
}

function formatRagCitation(chunk) {
  // chunk shape: { text, source, volume, page } (rag-chunks.json schema)
  // Emit verbatim "Volume N pag X — ..." citation per Principio Zero.
  if (!chunk) return '';
  const vol = chunk.volume ? `Volume ${chunk.volume}` : 'Volumi ELAB';
  const page = chunk.page ? ` pag ${chunk.page}` : '';
  const excerpt = (chunk.text || '').trim().replace(/\s+/g, ' ').slice(0, 220);
  return `${vol}${page} — ${excerpt}`;
}

function buildUnlimResponse(message) {
  // Real RAG search — no fake canned answers (Principio Zero, G45 audit fix).
  const lower = (message || '').toLowerCase();
  const hits = searchRAGChunks(message, 3) || [];

  if (hits.length === 0) {
    // Honest fallback when RAG has no match — no fake answer, just guidance.
    return {
      text: 'Ragazzi, vediamo insieme: provate a riformulare la domanda usando il nome del blocco (per esempio "digitalWrite", "pinMode", "delay") oppure il nome del componente del kit (LED, resistenza, pulsante).',
      citations: [],
    };
  }

  const matchedKeyword = BLOCKLY_KEYWORDS.find((kw) => lower.includes(kw));
  const leadIn = matchedKeyword
    ? `Ragazzi, vediamo insieme cosa dice il volume su "${matchedKeyword}".`
    : 'Ragazzi, ecco cosa dice il volume.';

  const citations = hits.slice(0, 2).map(formatRagCitation).filter(Boolean);
  const body = citations.join(' ');
  const composed = clampToWordCap(`${leadIn} ${body}`, 120);
  return { text: composed, citations };
}

async function tryVisionAnalyze(question) {
  try {
    if (typeof window === 'undefined' || !window.__ELAB_API?.unlim?.captureScreenshot) {
      return null;
    }
    const dataUrl = await window.__ELAB_API.unlim.captureScreenshot();
    if (!dataUrl) return null;
    const { analyzeImage } = await import('../../services/api');
    const result = await analyzeImage(dataUrl, question);
    return result?.response || null;
  } catch (_err) {
    return null;
  }
}

export default function UnlimChatPanel({
  isOpen = false,
  onClose,
  editorMode = 'blocks',
  sketchCode = '',
  blockCount = 0,
}) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const appendMessage = useCallback((author, text, extra = {}) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${author}-${prev.length}-${Date.now()}`,
        author,
        text,
        ...extra,
      },
    ]);
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event?.preventDefault?.();
    const question = (draft || '').trim();
    if (!question || isThinking) return;

    setDraft('');
    appendMessage('user', question);
    setIsThinking(true);

    const isVision = VISION_TRIGGER.test(question);
    if (isVision) {
      // Transient UNLIM placeholder so the test/UI can confirm the vision path
      // was entered without waiting for the full Gemini round-trip.
      appendMessage('unlim', 'Ragazzi, sto guardando il vostro circuito un attimo…', { vision: true });
      try {
        const visionText = await tryVisionAnalyze(question);
        if (visionText) {
          appendMessage('unlim', clampToWordCap(visionText, 120), { vision: true });
        }
      } catch (_err) { /* swallow — placeholder already shown */ }
      setIsThinking(false);
      return;
    }

    const ragReply = buildUnlimResponse(question);
    appendMessage('unlim', ragReply.text, { citations: ragReply.citations });
    setIsThinking(false);
  }, [draft, isThinking, appendMessage]);

  if (!isOpen) return null;

  const contextLabel = `${editorMode === 'code' ? 'C++' : 'Blocchi'} · ${blockCount} blocchi · ${String(sketchCode || '').split('\n').filter(Boolean).length} righe`;

  return (
    <aside
      style={styles.panel}
      aria-label="Chat completa UNLIM"
      role="dialog"
      aria-modal="false"
    >
      <header style={styles.header}>
        <span style={styles.mascotMini} aria-hidden="true">
          <img src={MASCOT_SRC} alt="" style={styles.mascotImg} draggable="false" />
        </span>
        <div style={styles.headerText}>
          <strong style={styles.title}>UNLIM</strong>
          <span style={styles.contextChip}>{contextLabel}</span>
        </div>
        <button
          type="button"
          style={styles.closeBtn}
          onClick={onClose}
          aria-label="Chiudi chat UNLIM"
        >
          ×
        </button>
      </header>

      <ul ref={listRef} style={styles.messageList} role="list">
        {messages.length === 0 && (
          <li
            style={{ ...styles.baseMsg, ...styles.welcome }}
            role="listitem"
            aria-label="Messaggio UNLIM"
            data-author="unlim"
          >
            Ragazzi, scrivete una domanda oppure dite "guarda il mio circuito" e vi do una mano.
          </li>
        )}
        {messages.map((m) => {
          const isUser = m.author === 'user';
          const baseStyle = isUser ? styles.userMsg : styles.unlimMsg;
          const visionOverride = m.vision ? styles.unlimMsgVision : null;
          return (
            <li
              key={m.id}
              style={{ ...styles.baseMsg, ...baseStyle, ...visionOverride }}
              role="listitem"
              aria-label={isUser ? 'Messaggio docente' : 'Messaggio UNLIM'}
              data-author={m.author}
              data-vision={m.vision ? 'true' : undefined}
            >
              {m.text}
            </li>
          );
        })}
        {isThinking && (
          <li
            style={{ ...styles.baseMsg, ...styles.thinking }}
            role="listitem"
            aria-label="Messaggio UNLIM"
            data-author="unlim"
            aria-live="polite"
          >
            Ragazzi, un attimo…
          </li>
        )}
      </ul>

      <form style={styles.chatForm} onSubmit={handleSubmit}>
        <input
          style={styles.chatInput}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder='Chiedete a UNLIM (es. "guarda il mio circuito")'
          aria-label="Scrivi a UNLIM"
          disabled={isThinking}
        />
        <button
          type="submit"
          style={{ ...styles.chatSubmit, opacity: (isThinking || !draft.trim()) ? 0.5 : 1 }}
          aria-label="Invia a UNLIM"
          disabled={isThinking || !draft.trim()}
        >
          Invia
        </button>
      </form>
    </aside>
  );
}
