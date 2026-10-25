/** One browser application's session lifetime; never an authentication authority. */
export type StudySessionEnd = { reason: "rejected" | "logout"; epoch: number };
let epoch = 0;
let active = false;
let controller = new AbortController();
const listeners = new Set<(event: StudySessionEnd) => void>();

export class StudySessionChangedError extends Error {
  constructor() { super("session_changed"); this.name = "StudySessionChangedError"; }
}
export const studySessionEpoch = () => epoch;
export const isStudySessionEpoch = (expected: number) => expected === epoch;
export function assertStudySessionEpoch(expected: number) {
  if (!isStudySessionEpoch(expected)) throw new StudySessionChangedError();
}
export const studySessionTicket = () => ({ epoch, signal: controller.signal });
function advance() {
  const previous = controller;
  controller = new AbortController();
  epoch++;
  previous.abort();
}
/** A mounted application validates its cookie before exposing a private session. */
export function beginStudySessionCheck() {
  active = false;
  advance();
  return epoch;
}
/** Abort tracked old requests before an exchange can replace the browser cookie.
 * A failed body token does not end an otherwise valid private session. */
export function beginStudySessionExchange() {
  advance();
  return epoch;
}
/** Called only after an actual /me or login response in the same epoch. */
export function activateStudySession(expected: number) {
  if (!isStudySessionEpoch(expected)) return false;
  active = true;
  advance();
  return true;
}
export function endStudySession(reason: StudySessionEnd["reason"], expected: number) {
  if (!isStudySessionEpoch(expected) || !active) return false;
  active = false;
  advance();
  const event = { reason, epoch };
  for (const listener of listeners) listener(event);
  return true;
}
export function subscribeStudySessionEnd(listener: (event: StudySessionEnd) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
