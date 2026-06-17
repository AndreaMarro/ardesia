import React, { FormEvent, useState } from 'react';
import { executeIntent } from '../../features/unlimScreenAgent/intentExecutor';
import { requestUnlimIntent } from '../../features/unlimScreenAgent/llmClient';
import UnlimResponse from './UnlimResponse';

type UnlimChatInputProps = {
  onIntentLoaded?: (xml: string) => void;
  placeholder?: string;
};

export default function UnlimChatInput({
  onIntentLoaded,
  placeholder = 'Chiedi a UNLIM di creare i blocchi...',
}: UnlimChatInputProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [xml, setXml] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nl = prompt.trim();
    if (!nl || loading) return;

    setLoading(true);
    setError(null);
    setMessage('');
    setXml(null);

    const response = await requestUnlimIntent(nl);
    if (!response.ok || !response.intent) {
      setError(response.error || 'Intent non valido');
      setLoading(false);
      return;
    }

    const result = executeIntent(response.intent);
    if (!result.ok || !result.xml) {
      setError(result.error || 'Non riesco a caricare i blocchi');
      setLoading(false);
      return;
    }

    onIntentLoaded?.(result.xml);
    setXml(result.xml);
    setMessage('Blocchi creati e caricati nello workspace.');
    setPrompt('');
    setLoading(false);
  }

  return (
    <section aria-label="UNLIM crea blocchi">
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={500}
          placeholder={placeholder}
          aria-label="Prompt per creare blocchi UNLIM"
          disabled={loading}
          style={{ flex: 1, minHeight: 44 }}
        />
        <button type="submit" disabled={!prompt.trim() || loading}>
          Crea
        </button>
      </form>
      <UnlimResponse loading={loading} message={message} error={error} xml={xml} />
    </section>
  );
}
