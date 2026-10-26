import { it, expect } from "vitest";
import {
  livingSourceLink,
  readLivingRoute,
  livingSourceLocation,
} from "./lessonBridge";
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
it("updates only the living reference so an acknowledged save survives native refresh", () => {
  const next = livingSourceLocation(
    "https://ardesia.invalid/?view=materials&edition=fluidi&other=keep&living=old#passaggio",
    { resourceId: "note", revisionId: "saved" },
    "living-annotation",
  );
  const url = new URL(next);
  expect(url.searchParams.get("view")).toBe("materials");
  expect(url.searchParams.get("other")).toBe("keep");
  expect(url.hash).toBe("#passaggio");
  expect(readLivingRoute(url.search)?.ref.revisionId).toBe("saved");
});
