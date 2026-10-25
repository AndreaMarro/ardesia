import {
  assertStudySessionEpoch, endStudySession, isStudySessionEpoch,
  studySessionEpoch, studySessionTicket,
} from './sessionBoundary';
import { decodeOriginalAsset } from './originalAsset';
export type { OriginalAssetDescriptor, VerifiedOriginalAsset } from './originalAsset';

export class StudyApiError extends Error {
  status: number;
  sessionRejected: boolean;
  constructor(code: string, status: number, sessionRejected = false) {
    super(code); this.status = status; this.sessionRejected = sessionRejected;
  }
}

async function request<T>(path: string, options: RequestInit, decode: (response: Response, signal: AbortSignal) => Promise<T>): Promise<T> {
  const ticket = studySessionTicket();
  const controller = new AbortController();
  const signals = [ticket.signal, options.signal].filter((signal): signal is AbortSignal => !!signal);
  const abort = () => controller.abort();
  for (const signal of signals) {
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  }
  try {
    const response = await fetch(`/study${path}`, { ...options, credentials: 'same-origin', signal: controller.signal });
    assertStudySessionEpoch(ticket.epoch);
    const rejection = response.headers.get('X-Study-Session-Rejected');
    if (response.status === 401 && (rejection === 'cookie' || rejection === 'missing')) {
      endStudySession('rejected', ticket.epoch);
      throw new StudyApiError('unauthenticated', 401, true);
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'network_error' })) as { error?: string };
      assertStudySessionEpoch(ticket.epoch);
      throw new StudyApiError(error.error ?? 'request_failed', response.status);
    }
    const value = await decode(response, controller.signal);
    assertStudySessionEpoch(ticket.epoch);
    return value;
  } finally {
    for (const signal of signals) signal.removeEventListener('abort', abort);
  }
}
export function studyRequest<T>(path: string, body?: unknown, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(body === undefined ? undefined : { 'Content-Type': 'application/json' });
  new Headers(options.headers).forEach((value, key) => headers.set(key, value));
  return request(path, {
    ...options, method: options.method ?? (body === undefined ? 'GET' : 'POST'), headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }, response => response.json() as Promise<T>);
}
export const studyBlob = (path: string, options: RequestInit = {}) => request(path, options, response => response.blob());
export const studyOriginal = (id: string, options: RequestInit = {}) =>
  request('/assets/' + encodeURIComponent(id), options,
    (response, signal) => decodeOriginalAsset(response, id, signal));
/** Logout intent always closes this local session, without claiming server revocation. */
export async function signOutStudySession(allSessions = false): Promise<'CONFIRMED' | 'UNCONFIRMED' | null> {
  const epoch = studySessionEpoch();
  let outcome: 'CONFIRMED' | 'UNCONFIRMED' = 'CONFIRMED';
  let current = false;
  try {
    const result = await studyRequest<{ serverRevocation?: string }>(
      allSessions ? '/session/revoke-all' : '/session', allSessions ? {} : undefined,
      { method: allSessions ? 'POST' : 'DELETE' },
    );
    if (result.serverRevocation === 'UNCONFIRMED') outcome = 'UNCONFIRMED';
  } catch { outcome = 'UNCONFIRMED'; }
  finally {
    current = isStudySessionEpoch(epoch);
    if (current) endStudySession('logout', epoch);
  }
  return current ? outcome : null;
}
export const requestKey = () => crypto.randomUUID();
