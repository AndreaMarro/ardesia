// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/web/src/App.tsx";
import { readResourceDraft, writeResourceDraft } from "/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/web/src/components/sessionDraftCache.ts";

const me = { id: "session-student", role: "student", synthetic: true };
const edition = { id: "fluidi", teacherId: "tutor", capacity: 10, priceMinor: 3900,
  state: "confirmed", sessions: [], timezone: "Europe/Rome", title: "Percorso privato",
  courseId: "fisica-semestre-filtro", packId: "fisica-semestre-filtro", packVersion: 1,
  packSha256: "a".repeat(64), subject: "Fisica", duration: "DRAFT" };
const submission = { id: "submission", student_id: me.id, activity_id: "poiseuille-v1",
  revision: 1, parent_id: null, text: "PROCEDIMENTO PRIVATO C7", asset_refs: [],
  source_refs: [{ resourceId: "resource", revisionId: "revision", contextId: "context" }],
  receipt_id: "receipt", state: "received", feedback: [] };
const workspace = { edition, enrolled: true, resources: [], submissions: [submission],
  layouts: [], layoutSaved: false, layoutVersion: "layout" };
const json = (value: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(value), { status, headers });
const rejection = () => json({ error: "unauthenticated" }, 401, { "X-Study-Session-Rejected": "cookie" });
let child: "json" | "binary" = "json";
let reply: () => Promise<Response> = async () => rejection();
let logoutResponse: () => Promise<Response> = async () => json({ ok: true });
let actor = me;

beforeEach(() => {
  actor = me;
  child = "json";
  reply = async () => rejection();
  logoutResponse = async () => json({ ok: true });
  history.replaceState(null, "", "/?view=work&edition=fluidi");
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal("fetch", vi.fn(async (path: string, options: RequestInit = {}) => {
    if (path === "/study/me") return json(actor);
    if (path === "/study/session" && options.method === "DELETE") return logoutResponse();
    if (path === "/study/session" && options.method === "POST") return json(actor);
    if (path.startsWith("/study/editions?")) return json({ items: [edition], nextCursor: null });
    if (path.startsWith("/study/workspace?")) return json({ ...workspace,
      submissions: [{ ...submission, student_id: actor.id,
        asset_refs: child === "binary" ? ["original"] : [],
        source_refs: child === "json" ? submission.source_refs : [] }] });
    if (path.startsWith("/study/diary?")) return json({ threads: [], confirmedOpenCount: 0, candidateCount: 0 });
    if (path.startsWith("/study/resources/") || path.startsWith("/study/assets/")) return reply();
    if (path === "/study/health") return json({ capabilities: { invitationCodes: false } });
    if (path === "/study/course") return json({ ...edition, scope: "DRAFT pubblico" });
    throw Error("unexpected_test_http_path:" + path);
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); history.replaceState(null, "", "/"); });

async function openDelivery() {
  render(<App />);
  await import("/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/web/src/features/Work.tsx");
  fireEvent.click(await screen.findByRole("button", { name: "Consegne e feedback" }));
  await screen.findByText("PROCEDIMENTO PRIVATO C7");
  const details = screen.getByText("Originali, versione e ricevuta").closest("details")!;
  details.open = true;
  fireEvent(details, new Event("toggle"));
  return details;
}

test.each([["json", "cookie"], ["binary", "cookie"], ["json", "missing"]] as const)(
  "a verified child %s 401 (%s) removes the private application and opens access",
  async (kind, marker) => {
    child = kind;
    reply = async () => json({ error: "unauthenticated" }, 401, { "X-Study-Session-Rejected": marker });
    const storage = new Map<string, string>([["offline-draft:other-actor:other-course", "keep"]]);
    vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
    writeResourceDraft("private-memory", { text: "MEMORY DRAFT", key: "pending" });
    await openDelivery();
    await screen.findByRole("dialog");
    expect(screen.queryByText("PROCEDIMENTO PRIVATO C7")).toBeNull();
    expect(document.querySelector(".app-frame")).toBeNull();
    expect(new URL(location.href).searchParams.has("edition")).toBe(false);
    expect(readResourceDraft("private-memory")).toBeUndefined();
    expect(storage.get("offline-draft:other-actor:other-course")).toBe("keep");
  },
);

test.each([401, 403, 503])("an untrusted child %s preserves the private application", async (status) => {
  reply = async () => json({ error: status === 403 ? "forbidden" : "unavailable" }, status);
  await openDelivery();
  await screen.findByRole("alert");
  expect(screen.getByText("PROCEDIMENTO PRIVATO C7")).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("an anonymous initial authentication boundary remains public without opening access", async () => {
  const previous = globalThis.fetch;
  vi.stubGlobal("fetch", (path: string, options?: RequestInit) => path === "/study/me"
    ? Promise.resolve(json({ error: "unauthenticated" }, 401, { "X-Study-Session-Rejected": "missing" }))
    : previous(path, options));
  render(<App />);
  await screen.findByRole("button", { name: "Accedi al tuo spazio" });
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("explicit logout clears the private application even when server revocation is unconfirmed", async () => {
  logoutResponse = async () => json({ error: "server_busy", serverRevocation: "UNCONFIRMED" }, 503);
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "Consegne e feedback" }));
  await screen.findByText("PROCEDIMENTO PRIVATO C7");
  fireEvent.click(screen.getByRole("button", { name: /Esci/ }));
  await screen.findByRole("button", { name: "Accedi al tuo spazio" });
  expect(screen.queryByText("PROCEDIMENTO PRIVATO C7")).toBeNull();
  expect(screen.getByRole("alert").textContent).toMatch(/revoca.*non.*confermat/i);
});

test("a late rejection from the previous session cannot clear a newly authenticated actor", async () => {
  let finish!: (value: Response) => void;
  reply = () => new Promise<Response>((resolve) => { finish = resolve; });
  await openDelivery();
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  fireEvent.click(screen.getByRole("button", { name: /Esci/ }));
  fireEvent.click(await screen.findByRole("button", { name: "Accedi al tuo spazio" }));
  actor = { ...me, id: "new-session-student" };
  fireEvent.change(await screen.findByLabelText("Codice di accesso sintetico"), { target: { value: "synthetic" } });
  fireEvent.click(screen.getByRole("button", { name: "Accedi" }));
  await screen.findByText("Riprendiamo il filo.");
  await act(async () => finish(rejection()));
  expect(screen.getByText("Riprendiamo il filo.")).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
});
