// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/web/src/App.tsx";
import { writeResourceDraft } from "/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/web/src/components/sessionDraftCache.ts";

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


const loader = vi.hoisted(() => {
  let release!: () => void;
  let loaded!: () => void;
  return {
    gate: new Promise<void>(resolve => { release = resolve; }),
    resolved: new Promise<void>(resolve => { loaded = resolve; }),
    release: () => release(),
    loaded: () => loaded(),
    trace: [] as {phase: string; at: number}[],
  };
});
vi.mock("/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/web/src/features/Work.tsx", async (importOriginal) => {
  loader.trace.push({phase: "lazy-request-started", at: performance.now()});
  await loader.gate;
  const original = await importOriginal();
  loader.trace.push({phase: "actual-module-evaluated", at: performance.now()});
  loader.loaded();
  return original;
});


test("diagnostic: awaiting the actual dependency excludes cold import from the rejection assertion budget", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  vi.stubGlobal("fetch", (path: string, options?: RequestInit) => {
    calls.push(path);
    return originalFetch(path, options);
  });
  writeResourceDraft("private-memory", {text: "MEMORY DRAFT", key: "pending"});
  loader.trace.push({phase: "before-render", at: performance.now()});
  const opening = (async () => {
    render(<App />);
    await import("/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia/apps/web/src/features/Work.tsx");
    fireEvent.click(await screen.findByRole("button", {name: "Consegne e feedback"}));
    await screen.findByText("PROCEDIMENTO PRIVATO C7");
    const details = screen.getByText("Originali, versione e ricevuta").closest("details")!;
    details.open = true;
    fireEvent(details, new Event("toggle"));
  })();
  // The original query's clock expires while the candidate is waiting for its
  // real dependency, without changing either the query or test timeout.
  await expect(screen.findByRole("button", {name: "Consegne e feedback"})).rejects.toThrow(/Unable to find/);
  loader.trace.push({phase: "original-query-expired-candidate-awaiting-import", at: performance.now()});
  expect(calls.some(path => path.startsWith("/study/workspace?"))).toBe(true);
  expect(calls.some(path => path.startsWith("/study/resources/"))).toBe(false);
  loader.release();
  await opening;
  await screen.findByRole("dialog");
  loader.trace.push({phase: "verified-401-private-ui-cleared", at: performance.now()});
  expect(calls.some(path => path.startsWith("/study/resources/"))).toBe(true);
  expect(screen.queryByText("PROCEDIMENTO PRIVATO C7")).toBeNull();
  expect(document.querySelector(".app-frame")).toBeNull();
  expect(new URL(location.href).searchParams.has("edition")).toBe(false);
  console.log("SESSION_BOUNDARY_TRACE", JSON.stringify({timeline: loader.trace, calls}));
});
