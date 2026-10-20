import { useCallback, useEffect, useRef, useState } from "react";
import {
  describeError,
  studyRequest,
  type Edition,
  type StudyMe,
  type Workspace,
} from "./api";
type Listing = { items: Edition[]; nextCursor: string | null };
/** Server listings authorize selection; this cache only keeps UI data, never grants access. */
export function useCourseWorkspace(me: StudyMe | null) {
  const [listingVersion, setListingVersion] = useState(0);
  const preferred = useRef<{ actor: string; id: string } | null>(null);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [listing, setListing] = useState(true);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, Workspace>());
  const owner = useRef<string | undefined>(undefined);
  const current = useRef({ actor: me?.id, editionId });
  current.current = { actor: me?.id, editionId };
  const request = useRef<{ sequence: number; controller?: AbortController }>({
    sequence: 0,
  });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    cache.current.clear();
    setEditions([]);
    setEditionId(null);
    setData(null);
    setError("");
    owner.current = me?.id;
    if (!me) {
      setListing(false);
      return;
    }
    setListing(true);
    void (async () => {
      const items: Edition[] = [];
      let after: string | null = null;
      const seen = new Set<string>();
      do {
        const query = new URLSearchParams({ limit: "50" });
        if (after) query.set("after", after);
        const page = await studyRequest<Listing>(
          "/editions?" + query,
          undefined,
          { signal: controller.signal },
        );
        items.push(...page.items);
        after = page.nextCursor;
        if (after && seen.has(after)) throw new Error("invalid_cursor");
        if (after) seen.add(after);
      } while (after);
      if (!active) return;
      setEditions(items);
      const requested = new URL(location.href).searchParams.get("edition");
      const preference = preferred.current?.actor === me.id ? preferred.current.id : requested;
      const selected =
        items.find((item) => item.id === preference)?.id ?? items.find((item) => item.id === requested)?.id ?? items[0]?.id ?? null;
      preferred.current = null;
      setEditionId(selected);
      const url = new URL(location.href);
      if (selected) url.searchParams.set("edition", selected);
      else url.searchParams.delete("edition");
      history.replaceState(null, "", url);
    })()
      .catch((failure) => {
        if (active)
          setError(
            describeError(
              failure,
              "I corsi non sono disponibili. Riprova riaprendo lo spazio.",
            ),
          );
      })
      .finally(() => {
        if (active) setListing(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [me?.id, me?.role, listingVersion]);
  const refresh = useCallback(async () => {
    if (
      !me ||
      !editionId ||
      current.current.actor !== me.id ||
      current.current.editionId !== editionId
    )
      return;
    request.current.controller?.abort();
    const controller = new AbortController();
    const sequence = ++request.current.sequence;
    request.current.controller = controller;
    setLoading(true);
    setError("");
    try {
      const value = await studyRequest<Workspace>(
        "/workspace?" + new URLSearchParams({ editionId }),
        undefined,
        { signal: controller.signal },
      );
      if (
        sequence !== request.current.sequence ||
        controller.signal.aborted ||
        current.current.actor !== me.id ||
        current.current.editionId !== editionId
      )
        return;
      if (value.edition.id !== editionId)
        throw new Error("course_response_mismatch");
      cache.current.delete(editionId);
      cache.current.set(editionId, value);
      while (cache.current.size > 16)
        cache.current.delete(cache.current.keys().next().value!);
      setData(value);
    } catch (failure) {
      if (sequence === request.current.sequence && !controller.signal.aborted) {
        setError(
          describeError(failure, "Il corso non è disponibile. Puoi riprovare."),
        );
        throw failure;
      }
    } finally {
      if (sequence === request.current.sequence && !controller.signal.aborted)
        setLoading(false);
    }
  }, [me?.id, editionId]); // me is server-verified and keyed by identity.
  useEffect(() => {
    setData(editionId ? (cache.current.get(editionId) ?? null) : null);
    void refresh().catch(() => {});
    return () => {
      request.current.sequence++;
      request.current.controller?.abort();
    };
  }, [refresh, editionId]);
  function selectEdition(id: string) {
    if (!editions.some((item) => item.id === id)) return;
    const url = new URL(location.href);
    url.searchParams.set("edition", id);
    history.replaceState(null, "", url);
    setEditionId(id);
  }
  function reloadEditions(id: string) {
    if (!me || current.current.actor !== me.id) return;
    // The command response supplies a preference, never client authority.
    // A fresh server listing must include it before selection is possible.
    preferred.current = { actor: me.id, id };
    setListingVersion((value) => value + 1);
  }
  const sameActor = owner.current === me?.id;
  return {
    editions: sameActor ? editions : [],
    editionId: sameActor ? editionId : null,
    data: sameActor && data?.edition.id === editionId ? data : null,
    listing: !sameActor || listing,
    loading,
    error: sameActor ? error : "",
    refresh,
    selectEdition,
    reloadEditions,
  };
}
