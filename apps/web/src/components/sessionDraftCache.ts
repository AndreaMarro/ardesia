import { requestKey } from "../api";
/** Bounded, session-only UI drafts. Server resources/receipts remain authoritative. */
type Draft = { text: string; key: string };
const drafts = new Map<string, Draft>();
const listeners = new Set<() => void>();
let actor: string | undefined;
export function clearResourceDrafts() {
  drafts.clear();
  actor = undefined;
  listeners.forEach((fn) => fn());
}
export function ensureDraftActor(id: string) {
  if (actor !== id) {
    clearResourceDrafts();
    actor = id;
  }
}
export function readResourceDraft(key: string): Draft | undefined {
  return drafts.get(key);
}
export function writeResourceDraft(key: string, value: Draft) {
  drafts.delete(key);
  drafts.set(key, value);
  while (drafts.size > 24) drafts.delete(drafts.keys().next().value!);
  listeners.forEach((fn) => fn());
}
export function acknowledgeResourceDraft(key: string, request: string) {
  if (drafts.get(key)?.key === request)
    writeResourceDraft(key, { text: "", key: requestKey() });
}
export function subscribeResourceDraft(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
