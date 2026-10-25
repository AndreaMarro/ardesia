import { afterEach, expect, test, vi } from "vitest";
import { studyBlob, studyRequest } from "../../../studio/src/study/apiClient";
import { uploadOriginal } from "../../../studio/src/study/uploadOriginal";
import {
  activateStudySession, beginStudySessionCheck, beginStudySessionExchange, endStudySession, studySessionEpoch,
  StudySessionChangedError, subscribeStudySessionEnd,
} from "../../../studio/src/study/sessionBoundary";

const json = (value: unknown, status = 200, marker?: string) => new Response(JSON.stringify(value), {
  status, headers: marker ? { "X-Study-Session-Rejected": marker } : {},
});
const activate = () => activateStudySession(beginStudySessionCheck());
afterEach(() => { endStudySession("logout", studySessionEpoch()); vi.unstubAllGlobals(); });

test.each([{ headers: new Headers({ "Idempotency-Key": "same-commit" }) },
  { headers: [["Idempotency-Key", "same-commit"]] as HeadersInit }])(
  "HTTP idempotency survives every supported HeadersInit representation", async ({ headers }) => {
    const received: string[] = [];
    vi.stubGlobal("fetch", async (_path: string, options: RequestInit) => {
      received.push(new Headers(options.headers).get("Idempotency-Key")!);
      return json({ receiptId: "same-receipt" });
    });
    expect(await studyRequest("/submissions", { text: "original procedure" }, { headers: headers as HeadersInit }))
      .toEqual({ receiptId: "same-receipt" });
    expect(received).toEqual(["same-commit"]);
  },
);

test("concurrent verified rejections end one session once and cancel its other pending requests", async () => {
  activate();
  const events: string[] = [];
  const unsubscribe = subscribeStudySessionEnd(event => events.push(event.reason));
  const pending: { signal: AbortSignal; finish: (response: Response) => void }[] = [];
  vi.stubGlobal("fetch", (_path: string, options: RequestInit) => new Promise<Response>(finish => {
    pending.push({ signal: options.signal!, finish });
  }));
  const first = studyRequest("/diary").catch(error => error);
  const second = studyBlob("/assets/private").catch(error => error);
  pending[0].finish(json({ error: "unauthenticated" }, 401, "cookie"));
  expect(await first).toMatchObject({ status: 401 });
  expect(pending[1].signal.aborted).toBe(true);
  pending[1].finish(json({ error: "unauthenticated" }, 401, "missing"));
  expect(await second).toBeInstanceOf(StudySessionChangedError);
  expect(events).toEqual(["rejected"]);
  unsubscribe();
  activate();
  endStudySession("logout", studySessionEpoch());
  expect(events).toEqual(["rejected"]);
});

test("a successful body decoded after a new login cannot return old private data", async () => {
  activate();
  let finish!: (value: unknown) => void;
  vi.stubGlobal("fetch", async () => ({ ok: true, status: 200, headers: new Headers(),
    json: () => new Promise(resolve => { finish = resolve; }) }));
  const result = studyRequest("/resources/old").catch(error => error);
  await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
  activateStudySession(studySessionEpoch());
  finish({ text: "OLD PRIVATE BODY" });
  expect(await result).toBeInstanceOf(StudySessionChangedError);
});

test.each([
  [401, undefined], [401, "arbitrary"], [403, "cookie"], [503, "cookie"],
] as const)("status%s and marker%s cannot end an established session", async (status, marker) => {
  activate();
  const before = studySessionEpoch();
  vi.stubGlobal("fetch", async () => json({ error: "controlled_denial" }, status, marker));
  await expect(studyRequest("/session", { token: "invalid-body" })).rejects.toMatchObject({ status });
  expect(studySessionEpoch()).toBe(before);
});

test("an original upload uses the same trusted session boundary as JSON and binary reads", async () => {
  activate();
  const events: string[] = [];
  const unsubscribe = subscribeStudySessionEnd(event => events.push(event.reason));
  vi.stubGlobal("fetch", async () => json({ error: "unauthenticated" }, 401, "missing"));
  await expect(uploadOriginal(new File([new Uint8Array([1, 2, 3])], "original.pdf", { type: "application/pdf" }), "fluidi"))
    .rejects.toMatchObject({ status: 401, sessionRejected: true });
  expect(events).toEqual(["rejected"]);
  unsubscribe();
});

test("changing session while reading an upload never sends the old file under the new actor", async () => {
  activate();
  let finish!: (bytes: ArrayBuffer) => void;
  const file = new File([new Uint8Array([1, 2, 3])], "original.pdf", { type: "application/pdf" });
  Object.defineProperty(file, "arrayBuffer", { value: () => new Promise<ArrayBuffer>(resolve => { finish = resolve; }) });
  const requests: string[] = [];
  vi.stubGlobal("fetch", async (path: string) => { requests.push(path); return json({ id: "asset" }); });
  const upload = uploadOriginal(file, "fluidi").catch(error => error);
  activateStudySession(studySessionEpoch());
  finish(new Uint8Array([1, 2, 3]).buffer);
  expect(await upload).toBeInstanceOf(StudySessionChangedError);
  expect(requests).toEqual([]);
});


test("a failed exchange aborts tracked old requests without invalidating an established session", async () => {
  activate();
  const events: string[] = [];
  const unsubscribe = subscribeStudySessionEnd(event => events.push(event.reason));
  let oldSignal!: AbortSignal;
  vi.stubGlobal("fetch", async (path: string, options: RequestInit) => {
    if (path === "/study/resources/old") {
      oldSignal = options.signal!;
      return new Promise<Response>(() => {});
    }
    expect(oldSignal.aborted).toBe(true);
    return json({ error: "invalid_body_token" }, 401);
  });
  void studyRequest("/resources/old").catch(() => {});
  const epoch = beginStudySessionExchange();
  await expect(studyRequest("/session", { token: "invalid" })).rejects.toMatchObject({ status: 401, sessionRejected: false });
  expect(studySessionEpoch()).toBe(epoch);
  expect(events).toEqual([]);
  expect(endStudySession("logout", epoch)).toBe(true);
  expect(events).toEqual(["logout"]);
  unsubscribe();
});
