// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SourceViewer } from "../components/SourceViewer";
import { CircuitLabLink } from "../features/circuit-lab/CircuitSource";
import type { StudyResource } from "../api";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const resource: StudyResource = {
  id: "circuit-1", revisionId: "revision-1", contextId: "context-1",
  ownerId: "student-1", editionId: "s19-dc", visibility: "private", kind: "s19-circuit",
  sha256: "a".repeat(64),
  text: JSON.stringify({ schema: "s19-circuit.v1", components: [
    { id: "R2", kind: "R", a: "a", b: "0", value: "200" },
  ], question: { quantity: "voltage", target: "R2" }, prediction: "Prevedo 8 V", notes: "R1 consegnata" }),
};

test("exact circuit source uses a typed reader and preserves revision in laboratory link", async () => {
  const calls: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    calls.push(url);
    return new Response(JSON.stringify(url.endsWith("/availability") ? { frontendAvailable: true } : resource));
  }));
  render(<SourceViewer reference={{ resourceId: resource.id, revisionId: resource.revisionId, contextId: resource.contextId }} />);
  const link = await screen.findByRole("link", { name: "Apri questa revisione nel laboratorio" });
  expect(link.getAttribute("href")).toBe("/s19/circuit-lab/?edition=s19-dc&resource=circuit-1&revision=revision-1");
  expect(screen.getByRole("table", { name: "Componenti e versi dichiarati" })).toBeTruthy();
  expect(screen.getByText("Prevedo 8 V")).toBeTruthy();
  expect(screen.queryByLabelText("Originale della fonte")).toBeNull();
  expect(calls).toContain("/study/resources/circuit-1/revisions/revision-1");
});

test.each([false, undefined])("unavailable laboratory does not expose a broken link (%s)", async (frontendAvailable) => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ frontendAvailable }))));
  render(<CircuitLabLink editionId="s19-dc" />);
  expect(await screen.findByText("Il laboratorio circuiti non è disponibile in questo ambiente.")).toBeTruthy();
  expect(screen.queryByRole("link")).toBeNull();
});

test("invalid stored document is reported without raw JSON or a latest-reference fallback", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ...resource, text: "{}" }))));
  render(<SourceViewer reference={{ resourceId: resource.id, revisionId: resource.revisionId, contextId: resource.contextId }} />);
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Il circuito non è leggibile in questa revisione. Il riferimento non viene sostituito.");
  expect(screen.queryByRole("link", { name: /laboratorio/ })).toBeNull();
});
