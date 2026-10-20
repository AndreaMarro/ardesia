// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import StudyApp from "../../../studio/src/study/StudyApp";
import { studySessionEpoch } from "../../../studio/src/study/sessionBoundary";

const me = { id: "legacy-student", role: "student", synthetic: true };
const edition = { id: "fluidi", teacherId: "tutor", state: "confirmed", capacity: 10,
  priceMinor: 3900, sessions: [], timezone: "Europe/Rome", title: "Corso DRAFT",
  duration: "4 incontri", scope: "DRAFT" };
const json = (value: unknown, status = 200, headers?: HeadersInit) => new Response(JSON.stringify(value), { status, headers });
beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function service(workspace: () => Response, logout: () => Response = () => json({ ok: true })) {
  vi.stubGlobal("fetch", async (path: string, options: RequestInit = {}) => {
    if (path === "/study/me") return json(me);
    if (path.startsWith("/study/workspace?")) return workspace();
    if (path === "/study/session" && options.method === "DELETE") return logout();
    if (path === "/study/course") return json(edition);
    if (path === "/study/coursepack") return json({ error: "fixture_pack_unavailable" }, 503);
    throw Error("unexpected_legacy_test_http_path:" + path);
  });
}

test("the legacy application also removes its private surface after a verified missing session", async () => {
  let requested = false;
  service(() => { requested = true; return json({ error: "unauthenticated" }, 401, { "X-Study-Session-Rejected": "missing" }); });
  render(<StudyApp />);
  await waitFor(() => expect(requested).toBe(true));
  await waitFor(() => expect(screen.queryByRole("button", { name: "Esci" })).toBeNull());
  expect(screen.getByText("Accedi alla demo")).toBeTruthy();
});

test("legacy explicit logout also clears locally and preserves the unconfirmed revocation warning", async () => {
  service(() => json({ edition, enrolled: true, resources: [], submissions: [], layouts: [] }),
    () => json({ error: "server_busy", serverRevocation: "UNCONFIRMED" }, 503));
  render(<StudyApp />);
  fireEvent.click(await screen.findByRole("button", { name: "Esci" }));
  await waitFor(() => expect(screen.queryByRole("button", { name: "Esci" })).toBeNull());
  expect(await screen.findByText(/La revoca della sessione sul server non è confermata/)).toBeTruthy();
});

test("a login completed after the legacy application unmounts cannot activate a session", async () => {
  let finish!: (response: Response) => void;
  vi.stubGlobal("fetch", async (path: string) => {
    if (path === "/study/me") return json({ error: "unauthenticated" }, 401, { "X-Study-Session-Rejected": "missing" });
    if (path === "/study/session") return new Promise<Response>(resolve => { finish = resolve; });
    return json(edition);
  });
  const view = render(<StudyApp />);
  const details = screen.getByText("Accedi alla demo").closest("details")!;
  details.open = true;
  fireEvent.change(screen.getByLabelText("Accesso sintetico"), { target: { value: "fixture" } });
  fireEvent.click(screen.getByRole("button", { name: "Accedi" }));
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  const epoch = studySessionEpoch();
  view.unmount();
  await act(async () => finish(json(me)));
  expect(studySessionEpoch()).toBe(epoch);
});


test("a new login aborts previous requests before its exchange", async () => {
  let oldSignal: AbortSignal | undefined;
  let oldRequestAbortedBeforeLogin = false;
  let loginAttempted = false;
  vi.stubGlobal("fetch", async (path: string, options: RequestInit = {}) => {
    if (path === "/study/me") {
      oldSignal = options.signal!;
      return new Promise<Response>(() => {});
    }
    if (path === "/study/session") {
      oldRequestAbortedBeforeLogin = oldSignal?.aborted === true;
      loginAttempted = true;
      return json({ error: "invalid_session_token" }, 401);
    }
    return json(edition);
  });
  render(<StudyApp />);
  await waitFor(() => expect(oldSignal).toBeTruthy());
  const details = screen.getByText("Accedi alla demo").closest("details")!;
  details.open = true;
  fireEvent.change(screen.getByLabelText("Accesso sintetico"), { target: { value: "invalid" } });
  fireEvent.click(screen.getByRole("button", { name: "Accedi" }));
  await waitFor(() => expect(loginAttempted).toBe(true));
  expect(oldRequestAbortedBeforeLogin).toBe(true);
  expect(await screen.findByText("Accesso demo non valido, già usato o scaduto.")).toBeTruthy();
});
