import { expect, test } from "vitest";
import { destinations, type View } from "../navigation";

test("legacy callers expose exactly their mounted destinations", () => {
  expect(destinations(false).map(item => item.id)).toEqual(["today", "courses", "classroom", "work", "exam", "materials"]);
  expect(destinations(true).map(item => item.id)).toEqual(["today", "courses", "classroom", "work", "review", "materials"]);
});

test("autonomous study requires an explicit mounted-route opt-in", () => {
  const mounted: readonly View[] = ["today", "independent-study"];
  expect(destinations(false).some(item => item.id === "independent-study")).toBe(false);
  expect(destinations(false, mounted).map(item => item.id)).toEqual(["today", "independent-study"]);
});

test("an availability list does not grant teacher access to a student destination", () => {
  expect(destinations(true, ["today", "independent-study"]).map(item => item.id)).toEqual(["today"]);
});

test("an explicitly empty route list does not advertise unmounted functions", () => {
  expect(destinations(false, [])).toEqual([]);
});

test("a mounted personal memory route is available to both roles without a course", () => {
  for (const tutor of [false, true]) {
    expect(destinations(tutor).some(item => item.id === "memory")).toBe(false);
    expect(destinations(tutor, ["memory"]).map(item => item.label)).toEqual(["Memoria delle idee"]);
  }
});
