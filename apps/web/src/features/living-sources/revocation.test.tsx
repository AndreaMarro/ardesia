// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { beginStudySessionCheck } from "../../../../studio/src/study/sessionBoundary";
import { LivingSourceReader } from "./LivingSourceReader";
vi.mock("./PdfSurface", () => ({
  PdfSurface: () => <div>PDF runtime boundary</div>,
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("discards a delayed export after the exact resource loses authorization", async () => {
  beginStudySessionCheck();
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: "visible",
  });
  const bytes = new TextEncoder().encode("%PDF-synthetic");
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
  const source = {
    id: "source",
    revisionId: "v1",
    contextId: "ctx",
    ownerId: "teacher",
    editionId: "fluidi",
    kind: "living-source",
    visibility: "group",
    text: "x",
    sha256: hash,
    document: {
      title: "Idrostatica",
      version: "1",
      assetId: "asset",
      sha256: hash,
      pageCount: 1,
      coordinates: "pdf-normalized-unrotated-top-left-v1",
    },
  };
  const note = {
    id: "note",
    revisionId: "n1",
    contextId: "note-ctx",
    ownerId: "student",
    editionId: "fluidi",
    kind: "living-annotation",
    visibility: "private",
    text: "note",
    sha256: hash,
    annotation: {
      target: {
        resourceId: "source",
        revisionId: "v1",
        contextId: "ctx",
        documentSha256: hash,
        page: 1,
        rects: [[0.1, 0.1, 0.4, 0.1]],
        text: null,
      },
      blocks: [{ kind: "explanation", text: "Private note" }],
      lesson: null,
    },
  };
  let revoked = false;
  let release!: (r: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/export"))
        return new Promise<Response>((resolve) => {
          release = resolve;
        });
      if (revoked)
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
        });
      if (url.endsWith("/original"))
        return new Response(bytes, {
          headers: { "Content-Type": "application/pdf" },
        });
      return new Response(
        JSON.stringify(url.includes("/living-annotations/") ? note : source),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  const create = vi.fn(() => "blob:original");
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: create,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {});
  render(
    <LivingSourceReader
      reference={{ resourceId: "note", revisionId: "n1" }}
      kind="living-annotation"
      me={{ id: "student", role: "student", synthetic: true }}
    />,
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "Esporta fonte e annotazione" }),
  );
  await waitFor(() => expect(release).toBeTypeOf("function"));
  revoked = true;
  fireEvent.focus(window);
  await screen.findByRole("alert");
  await act(async () => {
    release(
      new Response(
        JSON.stringify({
          format: "ardesia-living-source-v1",
          private: "contents",
        }),
      ),
    );
  });
  expect(click).not.toHaveBeenCalled();
  expect(create).toHaveBeenCalledTimes(1);
});
