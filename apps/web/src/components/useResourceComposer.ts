import { useEffect, useRef, useState } from "react";
import {
  describeError,
  requestKey,
  studyRequest,
  type StudyResource,
} from "../api";
import {
  acknowledgeResourceDraft,
  readResourceDraft,
  subscribeResourceDraft,
  ensureDraftActor,
  writeResourceDraft,
} from "./sessionDraftCache";
type Options = {
  actorId?: string;
  editionId: string;
  kind: string;
  visibility: "group" | "private";
  successMessage: string;
  onCreated?: (resource: StudyResource) => void;
  onUpdate: () => Promise<void>;
};
export function useResourceComposer(options: Options) {
  const cacheKey = options.actorId
    ? JSON.stringify([options.actorId, options.editionId, options.kind])
    : null;
  const initial = useRef(
    cacheKey
      ? (readResourceDraft(cacheKey) ?? { text: "", key: requestKey() })
      : { text: "", key: requestKey() },
  );
  const [text, setText] = useState(initial.current.text),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const draft = useRef(initial.current),
    pending = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    if (options.actorId) ensureDraftActor(options.actorId);
    const unsubscribe = subscribeResourceDraft(() => {
      const saved = cacheKey ? readResourceDraft(cacheKey) : undefined;
      if (saved) {
        draft.current = saved;
        setText(saved.text);
      }
    });
    mounted.current = true;
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, []);
  function edit(value: string) {
    if (pending.current || value === draft.current.text) return;
    draft.current = { text: value, key: requestKey() };
    if (cacheKey) writeResourceDraft(cacheKey, draft.current);
    setText(value);
    setError("");
    setMessage("");
  }
  async function save() {
    if (pending.current || !draft.current.text.trim()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    const immutableDraft = draft.current;
    try {
      const resource = await studyRequest<StudyResource>(
        "/resources",
        {
          editionId: options.editionId,
          kind: options.kind,
          visibility: options.visibility,
          text: immutableDraft.text,
        },
        { headers: { "Idempotency-Key": immutableDraft.key } },
      );
      if (cacheKey) acknowledgeResourceDraft(cacheKey, immutableDraft.key);
      if (!mounted.current) return;
      // An acknowledged create remains successful even if the subsequent course refresh fails.
      draft.current = { text: "", key: requestKey() };
      setText("");
      setMessage(options.successMessage);
      options.onCreated?.(resource);
      try {
        await options.onUpdate();
      } catch {
        if (mounted.current)
          setMessage(
            options.successMessage +
              " La rilettura del corso non è disponibile.",
          );
      }
    } catch (failure) {
      if (mounted.current)
        setError(
          describeError(
            failure,
            "Il salvataggio non è riuscito. Il testo è ancora qui. Puoi riprovare.",
          ),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return { text, edit, busy, error, message, save };
}
