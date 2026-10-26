// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { SourceViewer } from "../../components/SourceViewer";
import { Materials } from "../Materials";
import type { StudyMe, StudyResource, Workspace } from "../../api";
import { beginStudySessionCheck } from "../../../../studio/src/study/sessionBoundary";
import type { LivingReference } from "./model";

vi.mock("./LivingSourceReader", () => ({
  LivingSourceReader: ({ reference, me }: { reference: LivingReference; me: StudyMe }) => (
    <div data-testid="authorized-living-reader">
      {me.id}:{reference.resourceId}:{reference.revisionId}
    </div>
  ),
}));

const me: StudyMe = { id: "source-student", role: "student", synthetic: true };
const source: StudyResource = {
  id: "source", revisionId: "source-v1", contextId: "source-context",
  editionId: "fluidi", ownerId: "source-teacher", kind: "living-source",
  visibility: "group", sha256: "a".repeat(64),
  text: JSON.stringify({ title: "Idrostatica originale", version: "1", assetId: "private-asset" }),
};
const annotation: StudyResource = {
  ...source, id: "annotation", revisionId: "annotation-v1", ownerId: me.id,
  kind: "living-annotation", visibility: "private",
  text: JSON.stringify({ blocks: [{ kind: "explanation", text: "La mia spiegazione" }] }),
};
const data: Workspace = {
  enrolled: true,
  edition: { id: "fluidi", teacherId: "source-teacher", capacity: 10, priceMinor: 0,
    state: "collecting", sessions: [], timezone: "Europe/Rome" },
  resources: [source, annotation], submissions: [], layouts: [],
  layoutSaved: true, layoutVersion: "b".repeat(64),
};

beforeEach(() => { beginStudySessionCheck(); history.replaceState(null, "", "/"); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); history.replaceState(null, "", "/"); });

test("Materials exposes typed PDF sources and annotations without legacy JSON editors", async () => {
  render(<Materials me={me} data={data} onUpdate={async () => {}} />);
  const library = await screen.findByRole("navigation", { name: "Fonti vive e annotazioni" });
  expect(within(library).getByRole("button", { name: /Idrostatica originale/ })).toBeTruthy();
  expect(within(library).getByRole("button", { name: /La mia spiegazione/ })).toBeTruthy();
  const legacy = screen.getByRole("complementary", { name: "Fonti disponibili" });
  expect(within(legacy).queryByRole("button", { name: /Idrostatica originale|La mia spiegazione/ })).toBeNull();
  expect(screen.queryByText(source.text)).toBeNull();
  expect(screen.queryByText(annotation.text)).toBeNull();
});

test("SourceViewer dispatches the exact revision under the authenticated actor, never the source owner", async () => {
  const calls: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input); calls.push(url);
    if (url === "/study/me") return Response.json(me);
    if (url === "/study/resources/source/revisions/source-v1") return Response.json(source);
    throw Error("unexpected request: " + url);
  }));
  render(<SourceViewer reference={{ resourceId: source.id, revisionId: source.revisionId,
    contextId: "caller-does-not-grant-access" }} onSelect={vi.fn()} />);
  const reader = await screen.findByTestId("authorized-living-reader");
  expect(reader.textContent).toBe("source-student:source:source-v1");
  expect(calls).toEqual(["/study/resources/source/revisions/source-v1", "/study/me"]);
  expect(screen.queryByRole("textbox", { name: "Originale della fonte" })).toBeNull();
  expect(screen.queryByText(source.text)).toBeNull();
});

test("session change invalidates a delayed actor response before a PDF reader can mount", async () => {
  let release!: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    if (String(input) === "/study/me") return new Promise<Response>(resolve => { release = resolve; });
    return Response.json(annotation);
  }));
  render(<SourceViewer reference={{ resourceId: annotation.id, revisionId: annotation.revisionId,
    contextId: annotation.contextId }} />);
  await screen.findByText("Verifica della sessione…");
  await act(async () => {
    beginStudySessionCheck();
    release(Response.json(me));
  });
  expect(screen.queryByTestId("authorized-living-reader")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("La sessione è cambiata.");
});
