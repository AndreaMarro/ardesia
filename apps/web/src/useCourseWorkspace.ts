import { useCallback, useEffect, useRef, useState } from "react";
import {
  describeError,
  StudyApiError,
  studyRequest,
  type Edition,
  type StudyMe,
  type Workspace,
} from "./api";
type Listing = { items: Edition[]; nextCursor: string | null };
type Paging = {
  actor: string;
  after: string | null;
  previous: (string | null)[];
};
/** Discovery is SQL-authorized and bounded: one page plus at most one exact lookup. */
export function useCourseWorkspace(me: StudyMe | null, sessionVersion = 0) {
  const actor = me ? `${me.id}:${me.role}:${sessionVersion}` : "";
  const [listingVersion, setListingVersion] = useState(0);
  const [paging, setPaging] = useState<Paging>({
    actor: "",
    after: null,
    previous: [],
  });
  const after = paging.actor === actor ? paging.after : null;
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const preferred = useRef<{ actor: string; id: string } | null>(null);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [listing, setListing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const cache = useRef(new Map<string, Workspace>());
  const owner = useRef("");
  const selectionOwner = useRef("");
  const expiredActor = useRef("");
  const generation = useRef(-1);
  const discoveryFailed = useRef(false);
  const current = useRef({ actor, editionId });
  current.current = { actor, editionId };
  const request = useRef<{ sequence: number; controller?: AbortController }>({
    sequence: 0,
  });
  const expireSession = useCallback(() => {
    expiredActor.current = actor;
    selectionOwner.current = "";
    request.current.sequence++;
    request.current.controller?.abort();
    cache.current.clear();
    preferred.current = null;
    setData(null);
    setEditionId(null);
    setEditions([]);
    setNextCursor(null);
    setLoading(false);
    setSessionExpired(true);
    discoveryFailed.current = false;
    const url = new URL(location.href);
    url.searchParams.delete("edition");
    history.replaceState(null, "", url);
  }, [actor]);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const reset =
      owner.current !== actor || generation.current !== listingVersion;
    if (owner.current !== actor) {
      expiredActor.current = "";
      setSessionExpired(false);
    }
    if (reset) {
      selectionOwner.current = "";
      request.current.sequence++;
      request.current.controller?.abort();
      setLoading(false);
      cache.current.clear();
      setEditions([]);
      setEditionId(null);
      setData(null);
    }
    owner.current = actor;
    generation.current = listingVersion;
    setError("");
    setNextCursor(null);
    discoveryFailed.current = false;
    if (!me || expiredActor.current === actor) {
      setListing(false);
      return;
    }
    setListing(true);
    const requested = new URL(location.href).searchParams.get("edition");
    const preference =
      preferred.current?.actor === actor ? preferred.current.id : requested;
    void (async () => {
      const query = new URLSearchParams({ limit: "50" });
      if (after) query.set("after", after);
      const page = await studyRequest<Listing>(
        "/editions?" + query,
        undefined,
        { signal: controller.signal },
      );
      if (
        page.items.length > 50 ||
        (page.nextCursor !== null && page.nextCursor === after)
      )
        throw Error("invalid_cursor");
      let resolved = page.items.find((item) => item.id === preference);
      if (preference && !resolved) {
        const exact = await studyRequest<Listing>(
          "/editions?" +
            new URLSearchParams({ limit: "1", editionId: preference }),
          undefined,
          { signal: controller.signal },
        );
        if (
          exact.items.length > 1 ||
          exact.nextCursor !== null ||
          exact.items.some((item) => item.id !== preference)
        )
          throw Error("course_response_mismatch");
        resolved = exact.items[0];
      }
      if (
        !active ||
        controller.signal.aborted ||
        expiredActor.current === actor ||
        current.current.actor !== actor
      )
        return;
      const selected = resolved ?? page.items[0];
      selectionOwner.current = selected ? actor : "";
      // A selected edition outside this page occupies one bounded extra slot.
      setEditions(
        resolved && !page.items.some((item) => item.id === resolved.id)
          ? [resolved, ...page.items]
          : page.items,
      );
      setNextCursor(page.nextCursor);
      preferred.current = null;
      if (!selected) {
        cache.current.clear();
        setData(null);
      }
      setEditionId(selected?.id ?? null);
      const url = new URL(location.href);
      if (selected) url.searchParams.set("edition", selected.id);
      else url.searchParams.delete("edition");
      history.replaceState(null, "", url);
    })()
      .catch((failure) => {
        if (
          active &&
          !controller.signal.aborted &&
          current.current.actor === actor
        ) {
          if (failure instanceof StudyApiError && failure.sessionRejected)
            expireSession();
          else discoveryFailed.current = true;
          setError(
            describeError(
              failure,
              "I corsi non sono disponibili. Puoi riprovare.",
            ),
          );
        }
      })
      .finally(() => {
        if (active && current.current.actor === actor) setListing(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [actor, listingVersion, after, expireSession]);
  const refresh = useCallback(async () => {
    if (
      !me ||
      !editionId ||
      current.current.actor !== actor ||
      selectionOwner.current !== actor ||
      expiredActor.current === actor ||
      current.current.editionId !== editionId
    )
      return;
    request.current.controller?.abort();
    const controller = new AbortController();
    const sequence = ++request.current.sequence;
    request.current.controller = controller;
    setLoading(true);
    setError("");
    const valid = () =>
      sequence === request.current.sequence &&
      !controller.signal.aborted &&
      current.current.actor === actor &&
      selectionOwner.current === actor &&
      expiredActor.current !== actor &&
      current.current.editionId === editionId;
    function removeAccess() {
      selectionOwner.current = "";
      setLoading(false);
      cache.current.delete(editionId!);
      setData(null);
      setEditionId(null);
      setEditions((previous) =>
        previous.filter((item) => item.id !== editionId),
      );
      discoveryFailed.current = true;
      const url = new URL(location.href);
      if (url.searchParams.get("edition") === editionId) {
        url.searchParams.delete("edition");
        history.replaceState(null, "", url);
      }
    }
    try {
      const value = await studyRequest<Workspace>(
        "/workspace?" + new URLSearchParams({ editionId }),
        undefined,
        { signal: controller.signal },
      );
      if (!valid()) return;
      if (value.edition.id !== editionId)
        throw Error("course_response_mismatch");
      if (!value.enrolled) {
        removeAccess();
        setError(
          "L’accesso a questa edizione è cambiato. Rileggi i tuoi corsi.",
        );
        return;
      }
      cache.current.delete(editionId);
      cache.current.set(editionId, value);
      while (cache.current.size > 16)
        cache.current.delete(cache.current.keys().next().value!);
      setData(value);
    } catch (failure) {
      if (valid()) {
        if (failure instanceof StudyApiError && failure.sessionRejected)
          expireSession();
        else if (
          failure instanceof StudyApiError &&
          [403, 404].includes(failure.status)
        )
          removeAccess();
        setError(
          describeError(failure, "Il corso non è disponibile. Puoi riprovare."),
        );
        throw failure;
      }
    } finally {
      if (valid()) setLoading(false);
    }
  }, [actor, editionId, expireSession]);
  useEffect(() => {
    setData(editionId ? (cache.current.get(editionId) ?? null) : null);
    void refresh().catch(() => {});
    return () => {
      request.current.sequence++;
      request.current.controller?.abort();
    };
  }, [refresh, editionId]);
  function selectEdition(id: string) {
    if (
      listing ||
      expiredActor.current === actor ||
      current.current.actor !== actor ||
      owner.current !== actor ||
      !editions.some((item) => item.id === id)
    )
      return;
    const url = new URL(location.href);
    // A scoped denial removes one selection, not the other independently
    // authorized entries in this actor's current discovery page.
    selectionOwner.current = actor;
    url.searchParams.set("edition", id);
    history.replaceState(null, "", url);
    setEditionId(id);
  }
  function reloadEditions(id: string) {
    if (
      !me ||
      expiredActor.current === actor ||
      current.current.actor !== actor
    )
      return;
    preferred.current = { actor, id };
    setPaging({ actor, after: null, previous: [] });
    setListingVersion((value) => value + 1);
  }
  function nextPage() {
    if (
      !me ||
      expiredActor.current === actor ||
      listing ||
      !nextCursor ||
      current.current.actor !== actor
    )
      return;
    if (editionId) preferred.current = { actor, id: editionId };
    setPaging((previous) =>
      previous.actor === actor && previous.after === nextCursor
        ? previous
        : {
            actor,
            after: nextCursor,
            previous: [
              ...(previous.actor === actor ? previous.previous : []),
              after,
            ],
          },
    );
  }
  function previousPage() {
    if (
      !me ||
      expiredActor.current === actor ||
      listing ||
      paging.actor !== actor ||
      !paging.previous.length ||
      current.current.actor !== actor
    )
      return;
    if (editionId) preferred.current = { actor, id: editionId };
    setPaging({
      actor,
      after: paging.previous.at(-1)!,
      previous: paging.previous.slice(0, -1),
    });
  }
  async function retry() {
    if (expiredActor.current === actor) return;
    if (discoveryFailed.current) {
      setListingVersion((value) => value + 1);
      return;
    }
    await refresh();
  }
  const sameActor = owner.current === actor;
  return {
    editions: sameActor ? editions : [],
    editionId: sameActor ? editionId : null,
    data: sameActor && data?.edition.id === editionId ? data : null,
    listing: !sameActor || listing,
    loading,
    sessionExpired,
    error: sameActor ? error : "",
    refresh,
    retry,
    selectEdition,
    reloadEditions,
    pagination: {
      page: paging.actor === actor ? paging.previous.length + 1 : 1,
      hasNext: sameActor && nextCursor !== null,
      hasPrevious: paging.actor === actor && paging.previous.length > 0,
      loading: !sameActor || listing,
      next: nextPage,
      previous: previousPage,
    },
  };
}
