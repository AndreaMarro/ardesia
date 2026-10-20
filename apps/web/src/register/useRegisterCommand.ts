import { useEffect, useRef, useState } from "react";
import { requestKey, studyRequest } from "../api";
import { isStudySessionEpoch } from "../../../studio/src/study/sessionBoundary";
import { ensureDraftActor, readResourceDraft, subscribeResourceDraft, writeResourceDraft } from "../components/sessionDraftCache";
import { registerError, type RegisterAck } from "./contracts";

type Envelope<D> = { draft: D; ack?: RegisterAck };
/** Uses the existing bounded session draft cache, never an administrative ledger. */
export function useRegisterCommand<D>(options: {
  actor: string; epoch: number; editionId: string; topic: string; initial: D;
  onAck: () => void;
}) {
  const cacheKey = JSON.stringify(["edition-register-v1", options.actor, options.epoch, options.editionId, options.topic]);
  const empty = useRef(options.initial);
  const read = () => {
    const cached = readResourceDraft(cacheKey);
    return cached?.text ? { value: JSON.parse(cached.text) as Envelope<D>, key: cached.key }
      : { value: { draft: empty.current } as Envelope<D>, key: cached?.key ?? requestKey() };
  };
  const initial = useRef(read());
  const [value, setValue] = useState(initial.current.value);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [code, setCode] = useState("");
  const draft = useRef(initial.current), pending = useRef(false), mounted = useRef(true);
  const onAck = useRef(options.onAck); onAck.current = options.onAck;
  const controller = useRef<AbortController | null>(null);
  const lastAck = useRef(value.ack?.receiptId);
  useEffect(() => {
    mounted.current = true; ensureDraftActor(options.actor);
    const unsubscribe = subscribeResourceDraft(() => {
      const cached = readResourceDraft(cacheKey);
      if (!cached || !isStudySessionEpoch(options.epoch)) return;
      draft.current = read(); setValue(draft.current.value);
      const receipt = draft.current.value.ack?.receiptId;
      if (receipt && receipt !== lastAck.current) { lastAck.current = receipt; onAck.current(); }
    });
    return () => { mounted.current = false; unsubscribe(); controller.current?.abort(); };
  }, []);
  function edit(next: D) {
    if (pending.current) return;
    const nextValue = { draft: next };
    draft.current = { value: nextValue, key: requestKey() };
    writeResourceDraft(cacheKey, { text: JSON.stringify(nextValue), key: draft.current.key });
    setValue(nextValue); setError(""); setCode("");
  }
  async function send(path: string, body: unknown, expected: { revision: number; status: string; entryId?: string }) {
    if (pending.current || !isStudySessionEpoch(options.epoch)) return;
    pending.current = true; setBusy(true); setError(""); setCode("");
    const key = draft.current.key;
    controller.current = new AbortController();
    try {
      const ack = await studyRequest<RegisterAck>(path, body, { signal: controller.current.signal, headers: { "Idempotency-Key": key } });
      if (!isStudySessionEpoch(options.epoch)) return;
      if (!ack || ack.editionId !== options.editionId || ack.mode !== "test" || typeof ack.receiptId !== "string" || !/^[0-9a-f]{32}$/.test(ack.receiptId)
        || typeof ack.recordId !== "string" || !/^[0-9a-f]{32}$/.test(ack.recordId)
        || (["RECORDED_MANUALLY", "VOIDED"].includes(expected.status) && (typeof ack.entryId !== "string" || !/^[0-9a-f]{32}$/.test(ack.entryId))) || ack.revision !== expected.revision || ack.status !== expected.status
        || (expected.entryId !== undefined && ack.entryId !== expected.entryId)) throw Error("register_response_invalid");
      // A late ACK can tombstone only the exact origin draft. A later edit survives.
      const saved = readResourceDraft(cacheKey);
      if (saved) {
        const latest = saved.text ? JSON.parse(saved.text) as Envelope<D> : { draft: empty.current };
        const next = { draft: saved.key === key ? empty.current : latest.draft, ack };
        writeResourceDraft(cacheKey, { text: JSON.stringify(next), key: saved.key === key ? requestKey() : saved.key });
      } else if (mounted.current) {
        const next = { draft: empty.current, ack };
        draft.current = { value: next, key: requestKey() }; setValue(next); onAck.current();
      }
    } catch (failure) {
      if (mounted.current && isStudySessionEpoch(options.epoch)) {
        const result = registerError(failure); setError(result.message); setCode(result.code);
      }
    } finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  return { draft: value.draft, ack: value.ack, busy, error, code, edit, send };
}
