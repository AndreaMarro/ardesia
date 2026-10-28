// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { studySessionEpoch } from "../../../studio/src/study/sessionBoundary";

const me = { id: "availability-teacher", role: "teacher", synthetic: true };
const course = { id: "fluidi", title: "Percorso sintetico", teacherId: "tutor", capacity: 10,
  priceMinor: 3900, state: "confirmed", sessions: [], timezone: "Europe/Rome", scope: "DRAFT" };
const json = (value: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(value), { status, headers });
const unavailable = () => json({ error: "backend_not_configured", remoteReady: false }, 503);
const anonymous = () => json({ error: "unauthenticated" }, 401, { "X-Study-Session-Rejected": "missing" });

beforeEach(() => {
  history.replaceState(null, "", "/");
  vi.stubGlobal("scrollTo", vi.fn());
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); history.replaceState(null, "", "/"); });

function service(reply: () => Response | Promise<Response>) {
  const fetch = vi.fn(async (path: string, _options?: RequestInit) => {
    if (path === "/study/me") return reply();
    if (path.startsWith("/study/editions?")) return json({ items: [], nextCursor: null });
    if (path === "/study/course") return json(course);
    if (path === "/study/health") return json({ capabilities: { invitationCodes: false } });
    throw Error("unexpected_availability_test_http_path:" + path);
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

test("an unconfigured Core exposes only local destinations and retries the real session check", async () => {
  let restored = false;
  let finish!: (response: Response) => void;
  const fetch = service(() => restored ? new Promise(resolve => { finish = resolve; }) : unavailable());
  render(<App />);
  await screen.findByRole("heading", { name: "Il Core non è configurato" });
  expect(screen.getByRole("link", { name: "Apri Studio" }).getAttribute("href")).toBe("/studio/");
  expect(screen.getByRole("link", { name: "Stato del rilascio" }).getAttribute("href")).toBe("/ops/release/");
  expect(screen.queryByRole("button", { name: "Accedi al tuo spazio" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Metti alla prova" })).toBeNull();
  expect(fetch.mock.calls.map(([path]) => path)).toEqual(["/study/me"]);

  restored = true;
  fireEvent.click(screen.getByRole("button", { name: "Riprova la connessione" }));
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  expect(screen.getByRole("status").textContent).toContain("Sto aprendo il tuo spazio");
  expect(screen.queryByRole("button", { name: "Riprova la connessione" })).toBeNull();
  expect(fetch.mock.calls.map(([path]) => path)).toEqual(["/study/me", "/study/me"]);
  await act(async () => finish(json(me)));
  await screen.findByRole("button", { name: /Esci dall’account/ });
  await screen.findByRole("heading", { name: "Il tuo spazio è pronto." });
  expect(screen.queryByRole("heading", { name: /Il Core/ })).toBeNull();
  expect(fetch.mock.calls.some(([path]) => path.startsWith("/study/editions?"))).toBe(true);
  expect(fetch.mock.calls.some(([path]) => path === "/study/course")).toBe(false);
});

test.each(["initial", "after retry"])("an anonymous 401 %s preserves the public login boundary", async (phase) => {
  let ready = phase === "initial";
  const fetch = service(() => ready ? anonymous() : unavailable());
  render(<App />);
  if (!ready) {
    await screen.findByRole("heading", { name: "Il Core non è configurato" });
    ready = true;
    fireEvent.click(screen.getByRole("button", { name: "Riprova la connessione" }));
  }
  const login = await screen.findByRole("button", { name: "Accedi al tuo spazio" });
  expect(screen.queryByRole("heading", { name: /Il Core/ })).toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() => expect(fetch.mock.calls.some(([path]) => path === "/study/course")).toBe(true));
  expect(fetch.mock.calls.some(([path]) => path.startsWith("/study/editions?"))).toBe(false);
  fireEvent.click(login);
  await screen.findByRole("dialog", { name: "Ritrova il tuo spazio." });
  expect(screen.getByLabelText("Codice di accesso sintetico")).toBeTruthy();
});

test.each(["network", "server"])("a %s failure does not pretend that the visitor is anonymous", async (failure) => {
  const fetch = service(() => {
    if (failure === "network") throw TypeError("Failed to fetch");
    return json({ error: "temporarily_unavailable" }, 503);
  });
  render(<App />);
  await screen.findByRole("heading", { name: "Il Core non è disponibile" });
  expect(fetch.mock.calls.map(([path]) => path)).toEqual(["/study/me"]);
  expect(screen.queryByRole("button", { name: "Accedi al tuo spazio" })).toBeNull();
});

test("unmount aborts a pending retry and its late success cannot activate a session", async () => {
  let pending = false;
  let finish!: (response: Response) => void;
  const fetch = service(() => pending ? new Promise(resolve => { finish = resolve; }) : unavailable());
  const app = render(<App />);
  await screen.findByRole("heading", { name: "Il Core non è configurato" });
  pending = true;
  fireEvent.click(screen.getByRole("button", { name: "Riprova la connessione" }));
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  const signal = fetch.mock.calls.at(-1)?.[1]?.signal;
  expect(signal?.aborted).toBe(false);
  const epoch = studySessionEpoch();
  app.unmount();
  expect(signal?.aborted).toBe(true);
  await act(async () => finish(json(me)));
  expect(studySessionEpoch()).toBe(epoch);
  expect(fetch.mock.calls.map(([path]) => path)).toEqual(["/study/me", "/study/me"]);
});
