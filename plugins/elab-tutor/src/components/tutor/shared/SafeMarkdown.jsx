// ============================================
// SafeMarkdown — Renderizza Markdown senza XSS
// Niente dangerouslySetInnerHTML
// © Andrea Marro — 2026
// ============================================

import React from 'react';

/**
 * Renderizza testo markdown in elementi React sicuri.
 * Supporta: **bold**, *italic*, `code`, ```codeblock```, newline, liste.
 * Escapa TUTTI i tag HTML.
 */
export default function SafeMarkdown({ text, className = '', stripActions = false }) {
  if (!text) return null;

  const cleanText = stripActions ? text.replace(/\[AZIONE:[^\]]+\]/gi, '') : text;
  const elements = parseMarkdown(cleanText);

  return (
    <div className={`safe-markdown ${className}`} style={{ fontSize: '0.88rem', color: 'var(--color-text-body, #1A1A2E)', lineHeight: 1.6 }}>
      {elements}
    </div>
  );
}

function parseMarkdown(text) {
  // Split su code blocks prima di tutto
  const codeBlockRegex = /```(?:cpp|arduino|c|javascript|python)?\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Testo prima del code block
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'codeblock', content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  // Testo rimanente
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.map((part, i) => {
    if (part.type === 'codeblock') {
      return (
        <pre key={i} style={{
          background: 'var(--color-code-bg, #1E1E2E)', color: 'var(--color-code-text, #CDD6F4)', padding: 12,
          borderRadius: 8, overflowX: 'auto', fontSize: '0.875rem',
          margin: '8px 0', fontFamily: "'Fira Code', 'Consolas', monospace",
          lineHeight: 1.5
        }}>
          <code>{part.content}</code>
        </pre>
      );
    }
    return <span key={i}>{parseInlineMarkdown(part.content)}</span>;
  });
}

function parseInlineMarkdown(text) {
  // Split su newlines
  const lines = text.split('\n');
  const result = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      result.push(<br key={`br-${lineIdx}`} />);
    }

    // Check for list items
    const listMatch = line.match(/^[-*]\s+(.+)/);
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);

    if (listMatch) {
      result.push(
        <div key={`li-${lineIdx}`} style={{ paddingLeft: 16, position: 'relative', marginBottom: 2 }}>
          <span style={{ position: 'absolute', left: 0 }}>•</span>
          {parseInlineFormatting(listMatch[1], lineIdx)}
        </div>
      );
    } else if (numberedMatch) {
      result.push(
        <div key={`li-${lineIdx}`} style={{ paddingLeft: 20, position: 'relative', marginBottom: 2 }}>
          <span style={{ position: 'absolute', left: 0, fontWeight: 600 }}>{numberedMatch[1]}.</span>
          {parseInlineFormatting(numberedMatch[2], lineIdx)}
        </div>
      );
    } else {
      result.push(<React.Fragment key={`line-${lineIdx}`}>{parseInlineFormatting(line, lineIdx)}</React.Fragment>);
    }
  });

  return result;
}

function parseInlineFormatting(text, lineKey = 0) {
  const parts = [];
  // Match bold, italic, inline code, markdown links [text](url), raw URLs
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<)"]+))/g;
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }

    if (match[2]) {
      parts.push(<strong key={`b-${lineKey}-${idx}`}>{escapeHtml(match[2])}</strong>);
    } else if (match[3]) {
      parts.push(<em key={`i-${lineKey}-${idx}`}>{escapeHtml(match[3])}</em>);
    } else if (match[4]) {
      parts.push(
        <code key={`c-${lineKey}-${idx}`} style={{
          background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4,
          fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '0.84em'
        }}>
          {escapeHtml(match[4])}
        </code>
      );
    } else if (match[5] && match[6]) {
      parts.push(
        <a key={`a-${lineKey}-${idx}`} href={match[6]} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
          {escapeHtml(match[5])}
        </a>
      );
    } else if (match[7]) {
      parts.push(
        <a key={`u-${lineKey}-${idx}`} href={match[7]} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
          {escapeHtml(match[7])}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
    idx++;
  }

  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }

  return parts.length > 0 ? parts : escapeHtml(text);
}

function escapeHtml(text) {
  // NOTE: React auto-escapes strings rendered as children, so manual HTML entity
  // escaping here double-encodes (e.g. `"` → `&quot;` becomes visible literal text
  // in the UI). Returning raw text lets React's reconciler handle XSS safety.
  // Callers keep using this name to preserve diff surface.
  return text;
}
