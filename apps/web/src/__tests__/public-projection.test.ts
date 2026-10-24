import { expect, test } from "vitest";
import { publicActivityResult, publicCaseCount, publicCourse, publicVisualState, publicGraphSeries } from "../publicPreview";

test.each([
  [0.5, "pressure", 1 / 16, "Q/Q0"],
  [1, "pressure", 1, "Q/Q0"],
  [2, "pressure", 16, "Q/Q0"],
  [0.5, "flow", 16, "Δp/Δp0"],
  [1, "flow", 1, "Δp/Δp0"],
  [2, "flow", 1 / 16, "Δp/Δp0"],
])("independent ratio oracle: radius %s at fixed %s", (radius, boundary, ratio, variable) => {
  const result = publicActivityResult(Number(radius), String(boundary));
  expect(result.ratio).toBe(ratio);
  expect(result.calculatedVariable).toBe(variable);
  expect(result.fixedQuantity).toBe(boundary);
  expect(result.activityId).toBe("poiseuille-v1");
  expect(result.editorialStatus).toBe("DRAFT");
});

test("all 31 slider values have both constraints, with no unapproved offer", () => {
  expect(publicCaseCount).toBe(62);
  for (let numerator = 10; numerator <= 40; numerator++) {
    const pressure = publicActivityResult(numerator / 20, "pressure");
    const flow = publicActivityResult(numerator / 20, "flow");
    expect(pressure.ratio * flow.ratio).toBeCloseTo(1, 14);
    expect(pressure.numericalCheck).toBe("deterministic");
    expect(pressure.version).toBe(1);
  }
  expect(publicCourse.sessions).toEqual([]);
  expect(publicCourse.priceMinor).toBeNull();
  expect(publicCourse.interestCollection).toBe("closed");
  expect(publicCourse.editorialStatus).toBe("DRAFT");
});

test.each([NaN, Infinity, -Infinity, 0, -1, 0.49, 2.01, 0.575])(
  "does not round or invent results for unsupported radius %s", (radius) => {
    expect(() => publicActivityResult(radius, "pressure")).toThrow(/non disponibile/);
  },
);
test("rejects an unknown constraint", () => {
  expect(() => publicActivityResult(1, "temperature")).toThrow(/non disponibile/);
});

test.each([
  [2, "pressure", 16, 1, 4], [2, "flow", 1, .0625, .25],
  [.5, "pressure", .0625, 1, .25], [.5, "flow", 1, 16, 4],
])("mean transport projection respects Q/A at radius %s and fixed %s", (radius, boundary, flowRatio, pressureRatio, meanSpeedRatio) => {
  expect(publicVisualState(Number(radius), String(boundary))).toEqual({flowRatio, pressureRatio, meanSpeedRatio});
  const graph = publicGraphSeries(String(boundary));
  expect(graph).toHaveLength(31);
  expect(graph.find(point => point.radius === radius)?.ratio).toBe(boundary === "pressure" ? flowRatio : pressureRatio);
});
