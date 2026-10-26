import { it, expect } from "vitest";
import { livingSourceLink, readLivingRoute } from "./lessonBridge";
it("opens exact historical references through Materials without requiring client contextId", () => {
  const url = livingSourceLink(
    { resourceId: "source", revisionId: "old" },
    "living-annotation",
    "fluidi",
    { lessonId: "idrostatica", activityId: "poiseuille-v1" },
  );
  const parsed = readLivingRoute(url.slice(url.indexOf("?")));
  expect(parsed).toEqual({
    ref: { resourceId: "source", revisionId: "old" },
    kind: "living-annotation",
    lesson: { lessonId: "idrostatica", activityId: "poiseuille-v1" },
  });
  expect(url.startsWith("/?")).toBe(true);
  expect(
    readLivingRoute(
      "?living=" +
        encodeURIComponent(
          '{"resourceId":"s","revisionId":"v","kind":"iframe"}',
        ),
    ),
  ).toBe(null);
  expect(readLivingRoute("?living=<svg/onload=alert(1)>")).toBe(null);
});
