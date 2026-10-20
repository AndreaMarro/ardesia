import { expect, test } from "vitest";
import { displayRect, pagePoint, translateRect, type PageGeometry } from "../integrations/notebook/model";

// Independent transforms for a nonzero CropBox [30,50,230,450], userUnit/zoom = 2.
const normal: PageGeometry = {
  width: 400, height: 800, viewBox: [30, 50, 230, 450],
  convertToPdfPoint: (x, y) => [30 + x / 2, 450 - y / 2],
  convertToViewportPoint: (x, y) => [(x - 30) * 2, (450 - y) * 2],
};
const rotated: PageGeometry = {
  ...normal, width: 800, height: 400,
  convertToPdfPoint: (x, y) => [30 + y / 2, 50 + x / 2],
  convertToViewportPoint: (x, y) => [(y - 50) * 2, (x - 30) * 2],
};
test("PDF coordinates survive nonzero CropBox, scaling and quarter-turn rotation", () => {
  expect(displayRect(normal, [.1, .2, .3, .1])).toEqual([40, 160, 120, 80]);
  expect(displayRect(rotated, [.1, .2, .3, .1])).toEqual([560, 40, 80, 120]);
  const [x, y] = pagePoint(rotated, 600, 100);
  expect(x).toBeCloseTo(.25); expect(y).toBeCloseTo(.25);
});
test("screen-right on a rotated page changes canonical y and clamps inside the page", () => {
  const moved = translateRect(rotated, [.1, .2, .3, .1], 80, 0);
  expect(moved[0]).toBeCloseTo(.1); expect(moved[1]).toBeCloseTo(.1);
  expect(displayRect(rotated, moved)[0]).toBeCloseTo(640);
  expect(translateRect(rotated, [.1, .2, .3, .1], 10000, -10000)).toEqual([0, 0, .3, .1]);
});
