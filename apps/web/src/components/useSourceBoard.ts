import { useEffect, useRef, useState } from "react";
import { describeError, studyRequest, type Workspace } from "../api";
import {
  restoreViews,
  viewSnapshot,
  type StudyPostitView,
} from "./sourceBoardModel";
type Acknowledged = { snapshot: string; version: string | undefined };
export function useSourceBoard(data: Workspace, onUpdate: () => Promise<void>) {
  const initial = restoreViews(data.layouts);
  const [views, setViews] = useState(initial);
  const [acknowledged, setAcknowledged] = useState<Acknowledged>({
    snapshot: viewSnapshot(initial),
    version: data.layoutVersion,
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [conflict, setConflict] = useState(false);
  const current = useRef(views),
    ack = useRef(acknowledged),
    pending = useRef(false),
    mounted = useRef(true),
    controller = useRef<AbortController | null>(null);
  current.current = views;
  ack.current = acknowledged;
  const serverSnapshot = viewSnapshot(restoreViews(data.layouts));
  useEffect(() => {
    const server = { snapshot: serverSnapshot, version: data.layoutVersion };
    if (
      server.snapshot === ack.current.snapshot &&
      server.version === ack.current.version
    )
      return;
    if (
      !pending.current &&
      viewSnapshot(current.current) === ack.current.snapshot
    ) {
      setViews(restoreViews(data.layouts));
      setAcknowledged(server);
    } else if (
      server.version !== ack.current.version &&
      server.snapshot !== ack.current.snapshot
    )
      setConflict(true);
  }, [data.layoutVersion, serverSnapshot]); // A server prop update must never overwrite an unsaved draft.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  const dirty = viewSnapshot(views) !== acknowledged.snapshot;
  function change(update: (previous: StudyPostitView[]) => StudyPostitView[]) {
    setViews((previous) => {
      const next = update(previous);
      current.current = next;
      return next;
    });
    setNotice("");
  }
  async function save() {
    if (pending.current || !ack.current.version || conflict) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const snapshot = viewSnapshot(current.current),
      version = ack.current.version;
    controller.current = new AbortController();
    try {
      const saved = await studyRequest<{
        saved: boolean;
        layoutVersion: string;
      }>(
        "/layout",
        {
          editionId: data.edition.id,
          views: JSON.parse(snapshot),
          expectedVersion: version,
        },
        { signal: controller.current.signal },
      );
      if (!mounted.current) return;
      if (saved.saved !== true || !/^[a-f0-9]{64}$/.test(saved.layoutVersion))
        throw Error("layout_acknowledgement_missing");
      const nextAck = { snapshot, version: saved.layoutVersion };
      ack.current = nextAck;
      setAcknowledged(nextAck);
      setNotice("Disposizione salvata.");
      try {
        await onUpdate();
      } catch {
        if (mounted.current)
          setNotice(
            "Disposizione salvata. La rilettura del corso non è disponibile.",
          );
      }
    } catch (failure) {
      if (!mounted.current) return;
      if (failure instanceof Error && failure.message === "stale_layout")
        setConflict(true);
      else
        setError(
          describeError(
            failure,
            "Disposizione non salvata. Le tue modifiche sono ancora qui.",
          ),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function reloadServer() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    controller.current = new AbortController();
    try {
      const latest = await studyRequest<Workspace>(
        "/workspace?editionId=" + encodeURIComponent(data.edition.id),
        undefined,
        { signal: controller.current.signal },
      );
      if (!mounted.current) return;
      const loaded = restoreViews(latest.layouts),
        nextAck = {
          snapshot: viewSnapshot(loaded),
          version: latest.layoutVersion,
        };
      if (!nextAck.version) throw Error("layout_version_missing");
      current.current = loaded;
      ack.current = nextAck;
      setViews(loaded);
      setAcknowledged(nextAck);
      setConflict(false);
      setNotice("Disposizione del server ricaricata.");
      try {
        await onUpdate();
      } catch {
        /* The explicit GET above already returned the acknowledged server layout. */
      }
    } catch (failure) {
      if (mounted.current)
        setError(
          describeError(
            failure,
            "Rilettura non riuscita. Le tue modifiche sono ancora qui.",
          ),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return {
    views,
    change,
    save,
    reloadServer,
    dirty,
    busy,
    error,
    conflict,
    notice,
    versionAvailable: Boolean(acknowledged.version),
  };
}
