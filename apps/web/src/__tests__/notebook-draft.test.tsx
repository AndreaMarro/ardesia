// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { beginStudySessionCheck } from "../../../studio/src/study/sessionBoundary";
import { useNotebookDraft } from "../integrations/notebook/useNotebookDraft";
import type { NotebookResource } from "../integrations/notebook/model";

const book = (revisionId = "v1", title = "Origine", id = "book"): NotebookResource => ({
  id, revisionId, contextId: "context", ownerId: "student", editionId: "fluidi", visibility: "private",
  kind: "scientific-notebook", text: title, sha256: "b".repeat(64),
  notebook: { v: 1, sha256: "c".repeat(64),
    source: { assetId: "pdf", sha256: "a".repeat(64), pageCount: 2, coordinates: "pdf-normalized-unrotated-top-left-v1" },
    state: { v: 1, title, annotations: [] } },
});
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
beforeEach(() => { beginStudySessionCheck(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("lost response, close, newer head and retry recover exactly the same request", async () => {
  const calls: { body: unknown; key: string | null }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
    calls.push({ body: JSON.parse(init.body as string), key: new Headers(init.headers).get("Idempotency-Key") });
    if (calls.length === 1) throw Error("response lost after commit");
    return response(book("v2", "Scritto"));
  }));
  const first = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  act(() => first.result.current.edit({ v: 1, title: "Scritto", annotations: [] }));
  await act(() => first.result.current.save());
  expect(first.result.current.uncertain).toBe(true);
  first.unmount();
  const next = renderHook(() => useNotebookDraft(book("v2", "Scritto"), "student", vi.fn()));
  expect(next.result.current.conflict).toBe(false);
  expect(next.result.current.uncertain).toBe(true);
  act(() => next.result.current.edit({ v: 1, title: "Must not replace frozen request", annotations: [] }));
  expect(next.result.current.state.title).toBe("Scritto");
  await act(() => next.result.current.save());
  expect(calls[1]).toEqual(calls[0]);
  expect(next.result.current.uncertain).toBe(false);
  expect(next.result.current.dirty).toBe(false);
  expect(next.result.current.resource.revisionId).toBe("v2");
});

test("conflict retains the draft; failed restore retains it too; retry loads the current head", async () => {
  let count = 0;
  vi.stubGlobal("fetch", vi.fn(async () => ++count === 1 ? response({ error: "stale_revision" }, 409)
    : count === 2 ? response({ error: "offline" }, 503) : response(book("v3", "Altro dispositivo"))));
  const view = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  act(() => view.result.current.edit({ v: 1, title: "Bozza privata", annotations: [] }));
  await act(() => view.result.current.save());
  expect(view.result.current.conflict).toBe(true);
  expect(view.result.current.state.title).toBe("Bozza privata");
  await act(() => view.result.current.discard());
  expect(view.result.current.state.title).toBe("Bozza privata");
  await act(() => view.result.current.discard());
  expect(view.result.current.state.title).toBe("Altro dispositivo");
  expect(view.result.current.resource.revisionId).toBe("v3");
  expect(view.result.current.conflict).toBe(false);
  expect(view.result.current.canUndo).toBe(false);
});

test("drafts survive in-app close but Undo never crosses source or actor boundaries", () => {
  const first = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  act(() => first.result.current.edit({ v: 1, title: "Privato", annotations: [] }));
  expect(first.result.current.canUndo).toBe(true);
  first.unmount();
  const other = renderHook(() => useNotebookDraft(book("v1", "Secondo", "other"), "student", vi.fn()));
  act(() => other.result.current.undo());
  expect(other.result.current.state.title).toBe("Secondo");
  other.unmount();
  const actor = renderHook(() => useNotebookDraft(book(), "peer", vi.fn()));
  expect(actor.result.current.state.title).toBe("Origine");
  actor.unmount();
  const back = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  expect(back.result.current.state.title).toBe("Privato");
  expect(back.result.current.canUndo).toBe(false);
});

test("session invalidation erases drafts even when their editor has already unmounted", () => {
  const first = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  act(() => first.result.current.edit({ v: 1, title: "Segreto", annotations: [] }));
  first.unmount();
  act(() => { beginStudySessionCheck(); });
  const next = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  expect(next.result.current.state.title).toBe("Origine");
  expect(next.result.current.canUndo).toBe(false);
});
test("leaving the tab warns about an unsaved notebook even after navigating away from its editor", () => {
  const first = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  act(() => first.result.current.edit({ v: 1, title: "Non perdere", annotations: [] }));
  first.unmount();
  const leaving = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(leaving);
  expect(leaving.defaultPrevented).toBe(true);
  act(() => { beginStudySessionCheck(); });
  const signedOut = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(signedOut);
  expect(signedOut.defaultPrevented).toBe(false);
});

test("a late old receipt cannot erase a newer draft created after recovering that receipt", async () => {
  let finish!: (r: Response) => void;
  let count = 0;
  vi.stubGlobal("fetch", vi.fn(async () => ++count === 1
    ? new Promise<Response>(resolve => { finish = resolve; }) : response(book("v2", "Salvato"))));
  const old = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  act(() => old.result.current.edit({ v: 1, title: "Salvato", annotations: [] }));
  let saving!: Promise<void>;
  act(() => { saving = old.result.current.save(); });
  old.unmount();
  const next = renderHook(() => useNotebookDraft(book("v2", "Salvato"), "student", vi.fn()));
  await act(() => next.result.current.save());
  act(() => next.result.current.edit({ v: 1, title: "Successiva privata", annotations: [] }));
  await act(async () => { finish(response(book("v2", "Salvato"))); await saving; });
  expect(next.result.current.state.title).toBe("Successiva privata");
  next.unmount();
  const reopened = renderHook(() => useNotebookDraft(book("v2", "Salvato"), "student", vi.fn()));
  expect(reopened.result.current.state.title).toBe("Successiva privata");
});

test("a different original SHA with the same resource id cannot recover the other original's draft", () => {
  const first = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  act(() => first.result.current.edit({ v: 1, title: "Vecchio PDF", annotations: [] }));
  first.unmount();
  const changed = book();
  changed.notebook.source.sha256 = "d".repeat(64);
  const next = renderHook(() => useNotebookDraft(changed, "student", vi.fn()));
  expect(next.result.current.state.title).toBe("Origine");
});

test("recovering an earlier receipt never hides a newer head already observed on reopen", async () => {
  let calls = 0;
  vi.stubGlobal("fetch", vi.fn(async () => {
    if (++calls === 1) throw Error("lost V2 response");
    return response(book("v2", "Mio salvataggio"));
  }));
  const first = renderHook(() => useNotebookDraft(book(), "student", vi.fn()));
  act(() => first.result.current.edit({ v: 1, title: "Mio salvataggio", annotations: [] }));
  await act(() => first.result.current.save()); first.unmount();
  const reopened = renderHook(() => useNotebookDraft(book("v3", "Altro editor"), "student", vi.fn()));
  await act(() => reopened.result.current.save());
  expect(reopened.result.current.uncertain).toBe(false);
  expect(reopened.result.current.conflict).toBe(true);
  expect(reopened.result.current.message).toContain("versione successiva");
  expect(reopened.result.current.state.title).toBe("Mio salvataggio");
});
