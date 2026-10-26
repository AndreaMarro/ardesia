// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PdfSurface } from "./PdfSurface";
import { createReader } from "./pdfRuntime";
import type { LivingSource } from "./model";
vi.mock("./pdfRuntime", () => ({
  createReader: vi.fn(),
  nativeText: vi.fn(async () => ""),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("closes a failed PDF worker and leaves an accessible error instead of a stalled reader", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  let fail!: (error: Error) => void;
  const failure = new Promise<Error>((resolve) => {
    fail = resolve;
  });
  const destroy = vi.fn();
  vi.mocked(createReader).mockResolvedValue({
    pdf: {
      numPages: 1,
      getOutline: async () => [],
      getPage: async () => {
        throw Error("thumbnail unavailable");
      },
    },
    viewer: {
      pagesPromise: Promise.resolve(),
      getPageView: () => ({ pdfPage: null }),
    },
    bus: { on: vi.fn(), off: vi.fn() },
    destroy,
    failure,
  } as never);
  render(
    <PdfSurface
      source={{ document: { pageCount: 1 } } as LivingSource}
      blob={new Blob(["%PDF-fixture"])}
      onSelect={vi.fn()}
      onResume={vi.fn()}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    fail(new Error("pdf_worker_failed"));
  });
  expect((await screen.findByRole("alert")).textContent).toContain(
    "interrotta",
  );
  expect(destroy).toHaveBeenCalled();
});
