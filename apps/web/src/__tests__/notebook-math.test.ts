// @vitest-environment jsdom
import { beforeAll, expect, test, vi } from "vitest";
// Explicitly use the browser engine, as Vite does in production (Node defaults to SSR).
// @ts-expect-error The distributed browser entry uses the package root declarations.
vi.mock("mathlive", async () => import("../../../../node_modules/mathlive/mathlive.mjs"));
beforeAll(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});
test("HTML command aliases cannot inject page styles, URLs, classes or identities", async () => {
  const { formulaMarkup } = await import("../integrations/notebook/mathField");
  for (const command of ["style", "htmlStyle", "class", "htmlClass", "cssId", "htmlId", "htmlData", "href"]) {
    const result = formulaMarkup(`\\${command}{position:fixed;inset:0;z-index:2147483647;background-image:url(https://example.invalid/probe)}{x}`);
    expect(result).not.toContain("example.invalid");
    expect(result).not.toContain("position:fixed");
    expect(result).not.toContain("2147483647");
    expect(result).toContain("x");
  }
});
test("the editor sanitizer rejects active CSS independently of command aliases and keeps math dimensions", async () => {
  const { sanitizeMathHTML, formulaMarkup } = await import("../integrations/notebook/mathField");
  const result = sanitizeMathHTML('<span style="height:1.4em;position:fixed;z-index:999;inset:0;background:url(https://example.invalid);color:red">x</span>');
  expect(result).toContain("height: 1.4em");
  expect(result).not.toContain("fixed"); expect(result).not.toContain("999"); expect(result).not.toContain("url");
  const math = formulaMarkup(String.raw`\frac{a+b}{c^2}=\sqrt{x}`);
  expect(math).toContain("ML__"); expect(math).toContain("height:"); expect(math).toContain("a");
});
test("creating the field before React mounts it does not call connected-only MathLive APIs", async () => {
  const { createMathField } = await import("../integrations/notebook/mathField");
  const element = createMathField("x^2", false, "Formula");
  expect(element.isConnected).toBe(false);
  expect(element.value).toBe("x^2");
  expect(element.getAttribute("aria-label")).toBe("Formula");
});
test("native text input is enabled only in the editor markup, never in static previews", async () => {
  const { sanitizeMathHTML } = await import("../integrations/notebook/mathField");
  const sink = '<span contenteditable="true" role="textbox" class="ML__keyboard-sink"></span>';
  expect(sanitizeMathHTML(sink, true)).toContain('contenteditable="true"');
  expect(sanitizeMathHTML(sink)).not.toContain("contenteditable");
  expect(sanitizeMathHTML('<span contenteditable="true" oninput="alert(1)">x</span>', true)).not.toContain("oninput");
});
