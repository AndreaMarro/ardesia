// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { SourceViewer } from "../components/SourceViewer";
import type { StudyResource } from "../api";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function deferredResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}
function resource(id: string): StudyResource {
  return {
    id,
    revisionId: "revision-" + id,
    contextId: "context-" + id,
    ownerId: "student-01",
    editionId: "fluidi",
    visibility: "private",
    kind: "notes",
    text: "Fonte " + id,
    sha256: "a".repeat(64),
  };
}
function reference(id: string) {
  return {
    resourceId: id,
    revisionId: "revision-" + id,
    contextId: "context-" + id,
  };
}
function context(id: string) {
  return {
    contextId: "context-" + id,
    resource: resource(id),
    observations: [
      {
        id: "observation-" + id,
        text: "Collegamento " + id,
        evidence: { text: "Procedimento " + id, revisionId: "revision-" + id },
      },
    ],
    omittedStale: 0,
  };
}
async function openContext() {
  const summary = screen.getByText("Fonte, versione e contesto");
  if (!(summary.closest("details") as HTMLDetailsElement).open)
    fireEvent.click(summary);
  fireEvent.click(
    screen.getByRole("button", { name: "Apri il contesto di lavoro" }),
  );
}

test("late context A cannot appear under source B and query uses the canonical parameter", async () => {
  const slow = deferredResponse(),
    calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      calls.push(url);
      if (url.startsWith("/study/context/context-A")) return slow.promise;
      if (url.startsWith("/study/context/context-B"))
        return new Response(JSON.stringify(context("B")));
      return new Response(
        JSON.stringify(resource(url.includes("/A/") ? "A" : "B")),
      );
    }),
  );
  const view = render(<SourceViewer reference={reference("A")} />);
  await screen.findByText("Fonte A");
  await openContext();
  view.rerender(<SourceViewer reference={reference("B")} />);
  await screen.findByText("Fonte B");
  await act(async () => {
    slow.resolve(new Response(JSON.stringify(context("A"))));
  });
  expect(screen.queryByText("Collegamento A")).toBeNull();
  await openContext();
  await screen.findByText("Collegamento B");
  expect(screen.getByText("Collegamento B")).toBeTruthy();
  expect(calls.filter((url) => url.startsWith("/study/context/"))).toEqual([
    "/study/context/context-A?query=&resourceId=A&revisionId=revision-A",
    "/study/context/context-B?query=&resourceId=B&revisionId=revision-B",
  ]);
});

test("a stale context error cannot replace the new source context", async () => {
  const slow = deferredResponse();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.startsWith("/study/context/context-A")) return slow.promise;
      if (url.startsWith("/study/context/context-B"))
        return new Response(JSON.stringify(context("B")));
      return new Response(
        JSON.stringify(resource(url.includes("/A/") ? "A" : "B")),
      );
    }),
  );
  const view = render(<SourceViewer reference={reference("A")} />);
  await screen.findByText("Fonte A");
  await openContext();
  view.rerender(<SourceViewer reference={reference("B")} />);
  await screen.findByText("Fonte B");
  await act(async () => {
    slow.resolve(
      new Response(JSON.stringify({ error: "forbidden" }), { status: 403 }),
    );
  });
  expect(screen.queryByRole("alert")).toBeNull();
  await openContext();
  await screen.findByText("Collegamento B");
  expect(screen.getByText("Collegamento B")).toBeTruthy();
});

test("unmount cancels a pending context request", async () => {
  let signal: AbortSignal | undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: RequestInit) => {
      if (url.startsWith("/study/context/")) {
        signal = options?.signal as AbortSignal;
        return new Promise<Response>(() => {});
      }
      return new Response(JSON.stringify(resource("A")));
    }),
  );
  const view = render(<SourceViewer reference={reference("A")} />);
  await screen.findByText("Fonte A");
  await openContext();
  view.unmount();
  expect(signal?.aborted).toBe(true);
});

test("historical context is identified without presenting it as the current source", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(
            url.startsWith("/study/context/")
              ? { ...context("A"), sourceState: "HISTORICAL" }
              : resource("A"),
          ),
        ),
    ),
  );
  render(<SourceViewer reference={reference("A")} />);
  await screen.findByText("Fonte A");
  await openContext();
  await screen.findByText("Contesto della versione consegnata");
  expect(screen.getByText("Collegamento A")).toBeTruthy();
});
