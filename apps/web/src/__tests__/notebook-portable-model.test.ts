import { expect, test } from "vitest";
import { readNotebookPreview } from "../../../studio/src/study/notebookPreview";
import {
  readNotebookSnapshot, type Annotation, type NotebookSnapshot,
} from "../../../studio/src/study/scientificNotebookSnapshot";

const assetId = "a".repeat(32), assetSha = "b".repeat(64);
const note = (changes: Partial<Annotation> = {}): Annotation => ({
  id: "note_1", page: 2, rect: [.1, .2, .3, .4], kind: "note", content: "Prima versione", ...changes,
});
function snapshot(annotations = [note()]): NotebookSnapshot {
  return {
    v: 1, sha256: "c".repeat(64),
    source: { assetId, sha256: assetSha, pageCount: 2, coordinates: "pdf-normalized-unrotated-top-left-v1" },
    state: { v: 1, title: "Quaderno", annotations },
  };
}
const derived = (book: NotebookSnapshot) => book.state.title
  + book.state.annotations.map(a => `\n[p. ${a.page}] ${a.content}`).join("");
function source(revisionId = "v1", book = snapshot()) {
  return {
    id: "resource", revisionId, contextId: "context", ownerId: "student",
    editionId: "fluidi", kind: "scientific-notebook", visibility: "private",
    text: derived(book), sha256: "d".repeat(64), notebook: book,
  };
}
const asset = () => ({
  id: assetId, mime: "application/pdf", sha256: assetSha, bytes: 3, base64: "UERG",
});
function bundle() {
  return {
    format: "ardesia-study-notebook-v1", schemaVersion: 1,
    resources: [source("v2", snapshot([note({ content: "Bozza privata V2" })]))],
    resourceRevisions: [source()], submissions: [], assets: [asset()], omissions: [],
  };
}
const read = (book: NotebookSnapshot) => readNotebookSnapshot(book, derived(book));

test("portable projection preserves exact historical state, edition and binary metadata without authority", () => {
  const input = bundle();
  const result = readNotebookPreview(input);
  expect(result.sources.map(r => [r.source.revisionId, r.current, r.source.notebook?.state.annotations[0].content]))
    .toEqual([["v2", true, "Bozza privata V2"], ["v1", false, "Prima versione"]]);
  expect(result.sources[1].source.editionId).toBe("fluidi");
  expect(result.assets[0]).toEqual(asset());
  expect(result.sources[1].source.notebook).not.toBe(input.resourceRevisions[0].notebook);
  input.resourceRevisions[0].notebook.state.annotations[0].rect[0] = .9;
  expect(result.sources[1].source.notebook?.state.annotations[0].rect).toEqual([.1, .2, .3, .4]);
  expect(result).not.toHaveProperty("authenticated");
});
test("legacy non-scientific sources and assets may omit edition and byte metadata", () => {
  const { notebook: _, editionId: __, ...legacy } = source();
  const { bytes: ___, ...legacyAsset } = asset();
  void _; void __; void ___;
  const result = readNotebookPreview({ ...bundle(), resources: [{ ...legacy, kind: "notes" }],
    resourceRevisions: [], assets: [legacyAsset] });
  expect(result.sources[0].source.editionId).toBeUndefined();
  expect(result.assets[0].bytes).toBeUndefined();
});
test("a missing original preserves the snapshot and declared omission without substituting another PDF", () => {
  const missing = readNotebookPreview({ ...bundle(), assets: [{ ...asset(), id: "e".repeat(32) }],
    omissions: ["Originale non incluso"] });
  expect(missing.sources[0].source.notebook?.source.assetId).toBe(assetId);
  expect(missing.assets.some(a => a.id === assetId)).toBe(false);
  expect(missing.sources[0].source.notebook?.state.annotations[0].content).toBe("Bozza privata V2");
});
test("asset lookup is by exact identity, independent of order and same-hash originals", () => {
  const result = readNotebookPreview({ ...bundle(), assets: [
    { ...asset(), id: "e".repeat(32) }, asset(),
  ] });
  expect(result.sources[0].source.notebook?.source.assetId).toBe(assetId);
  expect(result.assets[1].id).toBe(assetId);
});
test.each([
  ["SHA", { sha256: "f".repeat(64) }],
  ["MIME", { mime: "image/png" }],
  ["missing byte count", { bytes: undefined }],
  ["empty PDF", { bytes: 0 }],
  ["PDF over budget", { bytes: 20 * 1024 * 1024 + 1 }],
])("included scientific original rejects %s mismatch", (_name, change) => {
  expect(() => readNotebookPreview({ ...bundle(), assets: [{ ...asset(), ...change }] }))
    .toThrow("invalid_notebook_presentation");
});
test("20 MiB originals are admitted at the presentation boundary; byte verification remains separate", () => {
  expect(readNotebookPreview({ ...bundle(), assets: [{ ...asset(), bytes: 20 * 1024 * 1024 }] }).assets[0].bytes)
    .toBe(20 * 1024 * 1024);
});
test("duplicate assets are rejected even when their contents agree", () => {
  expect(() => readNotebookPreview({ ...bundle(), assets: [asset(), asset()] }))
    .toThrow("invalid_notebook_presentation");
});
test("identical revision duplicates deduplicate, but changed snapshots with the same identity fail", () => {
  const input = bundle();
  expect(readNotebookPreview({ ...input, resourceRevisions: [...input.resourceRevisions, input.resources[0]] }).sources)
    .toHaveLength(2);
  const other = source("v2", snapshot([note({ content: "Conflicting snapshot" })]));
  expect(() => readNotebookPreview({ ...input, resourceRevisions: [other] }))
    .toThrow("invalid_notebook_presentation");
});
test.each(["assetId", "sha256", "pageCount"] as const)("a resource cannot change its original %s across revisions", key => {
  const input = bundle();
  const changed = input.resourceRevisions[0].notebook.source;
  if (key === "pageCount") changed.pageCount = 3;
  else changed[key] = key === "assetId" ? "e".repeat(32) : "e".repeat(64);
  expect(() => readNotebookPreview(input)).toThrow("invalid_notebook_presentation");
});
test("a resource cannot change kind across revisions or hide a notebook under a generic kind", () => {
  const input = bundle();
  const { notebook: _, ...ordinary } = input.resourceRevisions[0];
  void _;
  expect(() => readNotebookPreview({ ...input, resourceRevisions: [{ ...ordinary, kind: "notes" }] }))
    .toThrow("invalid_notebook_presentation");
  expect(() => readNotebookPreview({ ...input, resources: [{ ...input.resources[0], kind: "notes" }] }))
    .toThrow("invalid_notebook_presentation");
});
test("scientific snapshots require edition metadata, with the legacy codepoint budget retained", () => {
  const input = bundle();
  const { editionId: _, ...noEdition } = input.resources[0]; void _;
  expect(() => readNotebookPreview({ ...input, resources: [noEdition] })).toThrow("invalid_notebook_presentation");
  input.resources[0].editionId = "𝑥".repeat(8192);
  expect(readNotebookPreview(input).sources[0].source.editionId).toHaveLength(16384);
  input.resources[0].editionId += "x";
  expect(() => readNotebookPreview(input)).toThrow("invalid_notebook_presentation");
});
test.each([-1, .5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("invalid declared bytes %s are rejected", bytes => {
  expect(() => readNotebookPreview({ ...bundle(), assets: [{ ...asset(), bytes }] }))
    .toThrow("invalid_notebook_presentation");
});
test("known decoded asset bytes use the aggregate 50 MiB limit inclusively", () => {
  const input = { ...bundle(), resources: [], resourceRevisions: [], assets: [
    { ...asset(), bytes: 30 * 1024 * 1024 },
    { ...asset(), id: "e".repeat(32), bytes: 20 * 1024 * 1024 },
  ] };
  expect(readNotebookPreview(input).assets).toHaveLength(2);
  input.assets[1].bytes++;
  expect(() => readNotebookPreview(input)).toThrow("invalid_notebook_presentation");
});
test.each([
  [NaN, 0, .2, .2], [Infinity, 0, .2, .2], [-.1, 0, .2, .2],
  [0, 0, 0, .2], [0, 0, .2, -1], [.9, 0, .2, .2], [0, .9, .2, .2],
  [1, 0, .1, .1], [0, 0, "0.2", .2], [0, 0, .2],
])("invalid normalized geometry %s is refused before rendering", (...rect) => {
  const book = snapshot();
  book.state.annotations[0].rect = rect as Annotation["rect"];
  expect(() => read(book)).toThrow("invalid_notebook_presentation");
});
test.each([0, 3, .5, Infinity])("an annotation cannot target page %s outside the exact PDF", page => {
  expect(() => read(snapshot([note({ page })]))).toThrow("invalid_notebook_presentation");
});
test("annotation IDs are bounded, unique and strict even at a trailing newline", () => {
  expect(() => read(snapshot([note(), note()]))).toThrow("invalid_notebook_presentation");
  for (const id of ["", "x".repeat(65), "id\n", "__proto__<"]) {
    expect(() => read(snapshot([note({ id })]))).toThrow("invalid_notebook_presentation");
  }
});
test("Unicode content limits follow Core codepoints, reject NUL/unpaired surrogates, and preserve formulas", () => {
  const book = snapshot([note({ kind: "formula", content: "𝑥".repeat(5000) })]);
  expect(read(book).state.annotations[0].content.length).toBe(10000);
  for (const content of ["𝑥".repeat(5001), "a\0b", "\ud800", "\udc00", "\u001c"]) {
    expect(() => read(snapshot([note({ content })]))).toThrow("invalid_notebook_presentation");
  }
  expect(read(snapshot([note({ kind: "highlight", content: "" })])).state.annotations[0].content).toBe("");
  // Python strip does not classify BOM as whitespace.
  expect(read(snapshot([note({ content: "\ufeff" })])).state.annotations[0].content).toBe("\ufeff");
});
test("title, page count, annotations and derived text enforce the Core presentation limits", () => {
  const book = snapshot([]);
  book.state.title = "𝑥".repeat(200);
  expect(read(book).state.title.length).toBe(400);
  book.state.title += "x";
  expect(() => read(book)).toThrow("invalid_notebook_presentation");
  for (const pageCount of [0, 21, .5]) {
    const b = snapshot(); b.source.pageCount = pageCount;
    expect(() => read(b)).toThrow("invalid_notebook_presentation");
  }
  const many = Array.from({ length: 200 }, (_, i) => note({ id: `n${i}`, kind: "highlight", content: "" }));
  expect(read(snapshot(many)).state.annotations).toHaveLength(200);
  expect(() => read(snapshot([...many, note({ id: "last" })]))).toThrow("invalid_notebook_presentation");
  expect(() => read(snapshot(Array.from({ length: 4 }, (_, i) => note({ id: `n${i}`, content: "a".repeat(5000) })))))
    .toThrow("invalid_notebook_presentation");
  expect(() => readNotebookSnapshot(snapshot(), "Unrelated derived text")).toThrow("invalid_notebook_presentation");
});
test("snapshot schema, hashes and coordinate convention cannot be guessed or repaired", () => {
  for (const change of [
    { v: 2 }, { sha256: "not-a-hash" }, { extra: "unknown" },
    { source: { ...snapshot().source, coordinates: "screen-pixels" } },
    { source: { ...snapshot().source, assetId: assetId + "\n" } },
    { source: { ...snapshot().source, sha256: assetSha + "\n" } },
    { state: { ...snapshot().state, extra: 1 } },
  ]) {
    expect(() => readNotebookSnapshot({ ...snapshot(), ...change }, derived(snapshot())))
      .toThrow("invalid_notebook_presentation");
  }
});
