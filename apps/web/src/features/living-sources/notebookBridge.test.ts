import { it, expect } from "vitest";
import { notebookCopyState } from "./notebookBridge";
import type { LivingSource, SourceTarget } from "./model";
it("preserves full exact target and all regions even when the explanation reaches its limit", () => {
  const source = {
    id: "source",
    revisionId: "old",
    contextId: "context",
    document: { title: "T".repeat(200), version: "1", sha256: "a".repeat(64) },
  } as LivingSource;
  const target: SourceTarget = {
    resourceId: "source",
    revisionId: "old",
    contextId: "context",
    documentSha256: "a".repeat(64),
    page: 2,
    rects: Array.from({ length: 50 }, () => [0.1, 0.2, 0.3, 0.1]),
    text: {
      model: "native-pdfjs-items-concat-utf16-v1",
      start: 0,
      end: 5000,
      exact: "q".repeat(5000),
      prefix: "",
      suffix: "",
    },
  };
  const state = notebookCopyState(
    source,
    target,
    [{ kind: "explanation", text: "x".repeat(5000) }],
    { resourceId: "note", revisionId: "n1", contextId: "nc" },
  );
  expect(state.title.length).toBeLessThanOrEqual(200);
  const citation = JSON.parse(
    state.annotations
      .filter((a) => a.id.startsWith("citation-"))
      .map((a) => a.content)
      .join(""),
  );
  expect(citation.target).toEqual(target);
  expect(citation.annotation.revisionId).toBe("n1");
  expect(
    state.annotations.filter((a) => a.kind === "highlight").map((a) => a.rect),
  ).toEqual(target.rects);
  expect(state.annotations.every((a) => a.content.length <= 5000)).toBe(true);
  expect(
    state.title.length +
      state.annotations.reduce((n, a) => n + a.content.length + 20, 0),
  ).toBeLessThan(20000);
});
it("keeps notebook chunks valid Unicode at every content boundary", () => {
  const source = {
    id: "s",
    revisionId: "v",
    contextId: "c",
    document: {
      title: "a" + "💧".repeat(99),
      version: "1",
      sha256: "a".repeat(64),
    },
  } as LivingSource;
  const target: SourceTarget = {
    resourceId: "s",
    revisionId: "v",
    contextId: "c",
    documentSha256: "a".repeat(64),
    page: 1,
    rects: [[0.1, 0.1, 0.3, 0.1]],
    text: {
      model: "native-pdfjs-items-concat-utf16-v1",
      start: 0,
      end: 5000,
      exact: "💧".repeat(2500),
      prefix: "",
      suffix: "",
    },
  };
  for (const version of ["1", "12"]) {
    const state = notebookCopyState(
      { ...source, document: { ...source.document, version } },
      target,
      [{ kind: "explanation", text: "💧".repeat(2500) }],
    );
    for (const value of [
      state.title,
      ...state.annotations.map((a) => a.content),
    ])
      expect(
        Array.from(value).some((c) => {
          const n = c.codePointAt(0)!;
          return n >= 0xd800 && n <= 0xdfff;
        }),
      ).toBe(false);
    expect(
      JSON.parse(
        state.annotations
          .filter((a) => a.id.startsWith("citation-"))
          .map((a) => a.content)
          .join(""),
      ).target,
    ).toEqual(target);
  }
});
