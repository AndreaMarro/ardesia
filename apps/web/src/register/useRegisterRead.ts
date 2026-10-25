import { useCallback, useEffect, useRef, useState } from "react";
import { StudyApiError, studyRequest } from "../api";
import { registerError } from "./contracts";

/** One bounded server projection. Identity is checked before exposing any response. */
export function useRegisterRead<T>(scope: string, path: string, validate: (value: unknown) => value is T) {
  const [slot, setSlot] = useState<{ identity: string; value: T } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const identity = JSON.stringify([scope, path]);
  const current = useRef(identity); current.current = identity;
  const request = useRef<{ sequence: number; controller?: AbortController }>({ sequence: 0 });
  const validator = useRef(validate); validator.current = validate;
  const refresh = useCallback(async () => {
    request.current.controller?.abort();
    const controller = new AbortController(), sequence = ++request.current.sequence;
    request.current.controller = controller;
    const valid = () => current.current === identity && sequence === request.current.sequence && !controller.signal.aborted;
    setBusy(true); setError("");
    try {
      const value = await studyRequest<unknown>(path, undefined, { signal: controller.signal });
      if (!valid()) return;
      if (!validator.current(value)) throw Error("register_response_invalid");
      setSlot({ identity, value });
    } catch (failure) {
      if (!valid()) return;
      if (failure instanceof StudyApiError && [403, 404].includes(failure.status)) setSlot(null);
      setError(registerError(failure).message);
    } finally { if (valid()) setBusy(false); }
  }, [identity, path]);
  useEffect(() => {
    void refresh();
    return () => { request.current.sequence++; request.current.controller?.abort(); };
  }, [refresh]);
  return { data: slot?.identity === identity ? slot.value : null, busy, error, refresh };
}
