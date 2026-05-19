import React from 'react';

type UnlimResponseProps = {
  message?: string;
  error?: string | null;
  xml?: string | null;
  loading?: boolean;
};

export default function UnlimResponse({ message, error, xml, loading = false }: UnlimResponseProps) {
  if (loading) {
    return (
      <div role="status" aria-live="polite">
        UNLIM sta preparando i blocchi...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" style={{ color: 'var(--elab-red, #C62828)' }}>
        {error}
      </div>
    );
  }

  if (!message && !xml) return null;

  return (
    <div role="status" aria-live="polite">
      {message && <p>{message}</p>}
      {xml && (
        <details>
          <summary>Blockly XML</summary>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto' }}>{xml}</pre>
        </details>
      )}
    </div>
  );
}
