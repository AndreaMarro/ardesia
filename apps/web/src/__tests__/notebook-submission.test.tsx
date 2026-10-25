// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { SubmissionPanel } from "../../../studio/src/study/SubmissionPanel";

const me = { id: "student", role: "student" as const, synthetic: true as const };
const source = { resourceId: "book", revisionId: "v1", contextId: "context" };
let memory: Map<string, string>;
beforeEach(() => {
  memory = new Map();
  vi.stubGlobal("localStorage", { getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => memory.set(k, v), removeItem: (k: string) => memory.delete(k) });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
function typeAndSend() {
  fireEvent.change(screen.getByLabelText("La tua spiegazione"), { target: { value: "Conservo il rapporto delle aree." } });
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
}
test("a notebook attaches its exact PDF once, then a retry freezes source, PDF, text and key", async () => {
  memory.set("ardesia-study-draft:student:fluidi", JSON.stringify({ text: "", assetRefs: ["pdf"], key: "first", parentId: null }));
  const posts: { body: unknown; key: string | null }[] = [], gets: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    if (!init.body) { gets.push(url); return response({ id: "book", revisionId: "v1", contextId: "context",
      kind: "scientific-notebook", notebook: { source: { assetId: "pdf" } } }); }
    posts.push({ body: JSON.parse(init.body as string), key: new Headers(init.headers).get("Idempotency-Key") });
    return posts.length === 1 ? response({ error: "offline" }, 503) : response({ receiptId: "receipt", revision: 1 });
  }));
  const first = render(<SubmissionPanel me={me} source={source} parentId={null} onUpdate={async () => {}} />);
  typeAndSend();
  await screen.findByText(/Invio non ancora confermato/);
  first.unmount();
  render(<SubmissionPanel me={me} source={null} parentId={null} onUpdate={async () => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await screen.findByText(/Consegnato · ricevuta receipt/);
  expect(posts[1]).toEqual(posts[0]);
  expect(posts[0].body).toMatchObject({ assetRefs: ["pdf"], sourceRefs: [source] });
  expect(gets).toEqual(["/study/resources/book/revisions/v1"]);
});
test("stale source unlocks the explanation and permits selecting a newer exact revision", async () => {
  const posts: { body: unknown; key: string | null }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    if (!init.body) return response({ id: "book", revisionId: url.endsWith("v2") ? "v2" : "v1",
      contextId: "context", kind: "scientific-notebook", notebook: { source: { assetId: "pdf" } } });
    posts.push({ body: JSON.parse(init.body as string), key: new Headers(init.headers).get("Idempotency-Key") });
    return posts.length === 1 ? response({ error: "stale_source" }, 409) : response({ receiptId: "new", revision: 1 });
  }));
  const view = render(<SubmissionPanel me={me} source={source} parentId={null} onUpdate={async () => {}} />);
  typeAndSend();
  await screen.findByText(/La fonte è stata aggiornata/);
  expect(screen.getByLabelText("La tua spiegazione")).toHaveProperty("disabled", false);
  expect(screen.getByLabelText("La tua spiegazione")).toHaveProperty("value", "Conservo il rapporto delle aree.");
  view.rerender(<SubmissionPanel me={me} source={{ ...source, revisionId: "v2" }} parentId={null} onUpdate={async () => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await screen.findByText(/Consegnato · ricevuta new/);
  expect(posts[1].body).toMatchObject({ sourceRefs: [{ ...source, revisionId: "v2" }], assetRefs: ["pdf"] });
  expect(posts[1].key).not.toBe(posts[0].key);
});
test("the PDF attachment limit can be resolved by removing a draft reference, without deleting an original", async () => {
  memory.set("ardesia-study-draft:student:fluidi", JSON.stringify({
    text: "", assetRefs: ["a", "b", "c", "d", "e"], key: "first", parentId: null,
  }));
  const posts: { assetRefs: string[] }[] = [], methods: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
    methods.push(init.method ?? "GET");
    if (!init.body) return response({ id: "book", revisionId: "v1", contextId: "context",
      kind: "scientific-notebook", notebook: { source: { assetId: "pdf" } } });
    posts.push(JSON.parse(init.body as string)); return response({ receiptId: "resolved", revision: 1 });
  }));
  render(<SubmissionPanel me={me} source={source} parentId={null} onUpdate={async () => {}} />);
  typeAndSend();
  await screen.findByText(/La fonte aggiunge il suo PDF/);
  expect(posts).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Rimuovi allegato 1 dalla bozza" }));
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await screen.findByText(/Consegnato · ricevuta resolved/);
  expect(posts[0].assetRefs).toEqual(["b", "c", "d", "e", "pdf"]);
  expect(methods).not.toContain("DELETE");
});
