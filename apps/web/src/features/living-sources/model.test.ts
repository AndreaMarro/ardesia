import { describe, it, expect } from "vitest";
import {
  normalizedRects,
  textSelector,
  verifyTextSelector,
  decodeAnnotation,
  type TextSelector,
} from "./model";

describe("living source selectors", () => {
  it("inverts rotated CropBox coordinates using the existing notebook geometry", () => {
    const geometry = {
      viewBox: [10, 20, 110, 220],
      width: 400,
      height: 200,
      convertToPdfPoint: (x: number, y: number) => [10 + y / 2, 20 + x / 2],
      convertToViewportPoint: (x: number, y: number) => [
        (y - 20) * 2,
        (x - 10) * 2,
      ],
    };
    const rects = normalizedRects(geometry, [[40, 20, 80, 40]]);
    expect(rects[0][0]).toBeCloseTo(0.1);
    expect(rects[0][1]).toBeCloseTo(0.7);
    expect(rects[0][2]).toBeCloseTo(0.2);
    expect(rects[0][3]).toBeCloseTo(0.2);
  });
  it("keeps explicit UTF16 offsets and quote context, including surrogate pairs", () => {
    const text = "Acqua 💧: p = rho g h; equilibrio";
    const start = text.indexOf("p =");
    const end = text.indexOf(";");
    const selector = textSelector(text, start, end);
    expect(selector.exact).toBe("p = rho g h");
    expect(verifyTextSelector(text, selector)).toBe(true);
    expect(verifyTextSelector("x" + text, selector)).toBe(false);
    expect(
      verifyTextSelector(text, {
        ...selector,
        exact: "inventato",
      } as TextSelector),
    ).toBe(false);
  });
  it("rejects empty selection, external/active payloads and invalid rectangles", () => {
    expect(() => textSelector("a", 0, 0)).toThrow();
    expect(() =>
      decodeAnnotation({ target: { rects: [[0.9, 0, 0.8, 0.2]] }, blocks: [] }),
    ).toThrow();
    expect(() =>
      decodeAnnotation({
        target: {},
        blocks: [{ kind: "html", text: "<script/>" }],
      }),
    ).toThrow();
  });
});
it("does not split surrogate pairs at quote context boundaries", () => {
  const text = "💧" + "a".repeat(39) + "target" + "a".repeat(39) + "💧";
  const start = text.indexOf("target");
  const selector = textSelector(text, start, start + 6);
  expect(selector.prefix).not.toMatch(/[\udc00-\udfff]/u);
  expect(selector.suffix).not.toMatch(/[\ud800-\udbff]$/u);
  expect(verifyTextSelector(text, selector)).toBe(true);
  expect(() => textSelector("💧", 1, 2)).toThrow();
});
