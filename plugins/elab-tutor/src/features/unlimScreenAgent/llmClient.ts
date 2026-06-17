import { parseUnlimIntent, type UnlimIntent } from './intentSchema';
import { normalizeIntent } from './intentExecutor';

type RequestOptions = {
  signal?: AbortSignal;
  endpoint?: string;
  anonKey?: string;
};

type IntentResponse = {
  ok: boolean;
  intent?: UnlimIntent;
  error?: string;
  raw?: unknown;
};

const DEFAULT_EDGE_URL = 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1';

function getEdgeEndpoint(options: RequestOptions): string {
  if (options.endpoint) return options.endpoint;
  const edge = (import.meta.env.VITE_SUPABASE_EDGE_URL || DEFAULT_EDGE_URL).replace(/\/+$/, '');
  return `${edge}/unlim-intent`;
}

function getAnonKey(options: RequestOptions): string {
  return options.anonKey || import.meta.env.VITE_SUPABASE_EDGE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}

export async function requestUnlimIntent(prompt: string, options: RequestOptions = {}): Promise<IntentResponse> {
  const nl = String(prompt || '').trim();
  if (!nl) return { ok: false, error: 'Prompt vuoto' };
  if (nl.length > 500) return { ok: false, error: 'Prompt troppo lungo: massimo 500 caratteri' };

  try {
    const anonKey = getAnonKey(options);
    const response = await fetch(getEdgeEndpoint(options), {
      method: 'POST',
      signal: options.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : {}),
      },
      body: JSON.stringify({ prompt: nl }),
    });

    const raw = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        error: raw?.error || `UNLIM intent HTTP ${response.status}`,
        raw,
      };
    }

    const payload = raw?.intent || raw;
    const intent = parseUnlimIntent(normalizeIntent({
      ...(payload || {}),
      nl: payload?.nl || nl,
    }));
    return { ok: true, intent, raw };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
